import clsx from "clsx";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GTA_CRS, MAP_BOUNDS, toLatLng, toWorld } from "../map/crs";
import { lang, t } from "../i18n";
import { buildCategories } from "../map/groups";
import LocationsPanel from "../map/LocationsPanel";
import { blipIcon, playerIcon, waypointIcon } from "../map/markers";
import { mockLocations, mockMapUpdate } from "../mock";
import { useMenu } from "../store";
import { MAP_STYLES } from "../theme";
import { updateTheme } from "../themeActions";
import type { MapLocation } from "../types";
import { fetchNui, isEnvBrowser } from "../utils/nui";

export default function MapScreen() {
  const style = useMenu((s) => s.theme.mapStyle);
  const motion = useMenu((s) => s.theme.motion);
  const locations = useMenu((s) => s.locations);
  const player = useMenu((s) => s.player);
  const waypoint = useMenu((s) => s.waypoint);
  const route = useMenu((s) => s.route);

  const elRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const blipLayerRef = useRef<L.LayerGroup | null>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);
  const wpMarkerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline[]>([]);
  const centeredRef = useRef(false);

  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<{ key: string; idx: number } | null>(null);
  // Distance sorting uses the position when the map opened, once (not on every position update)
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  const categories = useMemo(() => buildCategories(locations, search, origin), [locations, search, origin]);
  const groups = useMemo(
    () => categories.flatMap((c) => (collapsed.has(c.name) && !search ? [] : c.groups)),
    [categories, collapsed, search],
  );
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const selectedGroup = groups.find((g) => g.key === selected?.key) ?? null;
  const selectedLoc: MapLocation | null = selectedGroup ? selectedGroup.items[(selected?.idx ?? 0) % selectedGroup.items.length] : null;

  const fly = useCallback(
    (x: number, y: number, minZoom = 4) => {
      const map = mapRef.current;
      if (!map) return;
      const z = Math.max(map.getZoom(), minZoom);
      if (motion) map.flyTo(toLatLng(x, y), z, { duration: 0.6 });
      else map.setView(toLatLng(x, y), z);
    },
    [motion],
  );

  const setWaypointAt = (x: number, y: number) => {
    if (isEnvBrowser()) {
      useMenu.getState().applyMapUpdate({ ...mockMapUpdate(), waypoint: { x, y }, route: [[player?.x ?? 0, player?.y ?? 0], [x, y]] });
      return;
    }
    void fetchNui("setWaypoint", { x, y });
  };
  const clearWaypoint = () => {
    if (isEnvBrowser()) {
      useMenu.getState().applyMapUpdate({ ...mockMapUpdate(), waypoint: null });
      return;
    }
    void fetchNui("clearWaypoint");
  };

  // Create / destroy the map
  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current, {
      crs: GTA_CRS,
      minZoom: 1,
      maxZoom: 6,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 110,
      attributionControl: false,
      zoomControl: false,
      keyboard: false,
      fadeAnimation: false, // show tiles instantly (per-frame opacity animation is wasted work)
      maxBounds: MAP_BOUNDS.pad(0.15),
      maxBoundsViscosity: 0.8,
    });
    map.setView(toLatLng(200, -800), 3);
    blipLayerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => {
      const w = toWorld(e.latlng);
      setWaypointAt(w.x, w.y);
    });
    map.on("contextmenu", () => clearWaypoint());
    mapRef.current = map;

    if (isEnvBrowser()) {
      useMenu.getState().setLocations(mockLocations);
      useMenu.getState().applyMapUpdate(mockMapUpdate());
    } else {
      void fetchNui("mapOpen");
    }

    return () => {
      if (!isEnvBrowser()) void fetchNui("mapClose");
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      playerMarkerRef.current = null;
      wpMarkerRef.current = null;
      routeRef.current = [];
      centeredRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    tileRef.current?.remove();
    tileRef.current = L.tileLayer(`tiles/${style}/{z}/{x}-{y}.webp`, {
      minZoom: 0,
      maxZoom: 6,
      maxNativeZoom: 5,
      noWrap: true,
      bounds: MAP_BOUNDS,
      keepBuffer: 3,
    }).addTo(map);
    tileRef.current.bringToBack();
  }, [style]);

  // Blip markers
  useEffect(() => {
    const layer = blipLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const loc of locations) {
      if (hidden.has(loc.category) || hidden.has(`${loc.category}|${loc.label}`)) continue;
      const isSel = loc === selectedLoc;
      const m = L.marker(toLatLng(loc.x, loc.y), { icon: blipIcon(loc.icon, loc.color, isSel), zIndexOffset: isSel ? 1000 : 0, keyboard: false });
      m.bindTooltip(loc.label, { direction: "top", offset: [0, -14], className: "pm-tip" });
      m.on("click", () => {
        const key = `${loc.category}|${loc.label}`;
        const g = groupsRef.current.find((x) => x.key === key);
        setSelected({ key, idx: g ? Math.max(0, g.items.indexOf(loc)) : 0 });
      });
      m.on("dblclick", () => setWaypointAt(loc.x, loc.y));
      layer.addLayer(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, hidden, selectedLoc]);

  // Player
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !player) return;
    const ll = toLatLng(player.x, player.y);
    if (!playerMarkerRef.current) {
      playerMarkerRef.current = L.marker(ll, { icon: playerIcon, zIndexOffset: 2000, interactive: false, keyboard: false }).addTo(map);
    } else {
      playerMarkerRef.current.setLatLng(ll);
    }
    // GTA heading: degrees counter-clockwise from north -> CSS rotates clockwise
    const arrow = playerMarkerRef.current.getElement()?.querySelector<SVGElement>(".pm-player-arrow");
    if (arrow) arrow.style.transform = `rotate(${-player.heading}deg)`;
    if (!centeredRef.current) {
      centeredRef.current = true;
      map.setView(ll, 3.5);
      setOrigin({ x: player.x, y: player.y });
    }
  }, [player]);

  // Waypoint + route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    wpMarkerRef.current?.remove();
    wpMarkerRef.current = null;
    routeRef.current.forEach((l) => l.remove());
    routeRef.current = [];
    if (!waypoint) return;
    wpMarkerRef.current = L.marker(toLatLng(waypoint.x, waypoint.y), { icon: waypointIcon, zIndexOffset: 1500, interactive: false, keyboard: false }).addTo(map);
    if (route && route.length > 1) {
      const pts = route.map(([x, y]) => toLatLng(x, y));
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#FFB020";
      routeRef.current = [
        L.polyline(pts, { color: "#08090c", weight: 9, opacity: 0.85, interactive: false, lineJoin: "round" }).addTo(map),
        L.polyline(pts, { color: accent, weight: 5, opacity: 1, interactive: false, lineJoin: "round" }).addTo(map),
      ];
    }
  }, [waypoint, route]);

  // Keyboard (only mounted while on the map tab)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement === searchRef.current || e.repeat) return;
      const map = mapRef.current;
      const s = useMenu.getState();
      if (!s.visible || s.closing || s.tab !== "map") return;

      if (e.key === " ") {
        e.preventDefault();
        if (s.player) fly(s.player.x, s.player.y, 3.5);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "PageUp" || e.key === "+") {
        map?.zoomIn(0.5);
      } else if (e.key === "PageDown" || e.key === "-") {
        map?.zoomOut(0.5);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!groups.length) return;
        const cur = groups.findIndex((g) => g.key === selected?.key);
        const next = cur === -1 ? 0 : (cur + (e.key === "ArrowDown" ? 1 : -1) + groups.length) % groups.length;
        const g = groups[next];
        setSelected({ key: g.key, idx: 0 });
        fly(g.items[0].x, g.items[0].y);
      } else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && selectedGroup) {
        e.preventDefault();
        cycle(selectedGroup.key, e.key === "ArrowRight" ? 1 : -1);
      } else if (e.key === "Enter" && selectedLoc) {
        setWaypointAt(selectedLoc.x, selectedLoc.y);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        clearWaypoint();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const select = (key: string) => {
    const g = groups.find((x) => x.key === key);
    if (!g) return;
    const idx = selected?.key === key ? selected.idx : 0;
    setSelected({ key, idx });
    const loc = g.items[idx % g.items.length];
    fly(loc.x, loc.y);
  };

  const cycle = (key: string, dir: 1 | -1) => {
    const g = groups.find((x) => x.key === key);
    if (!g) return;
    const base = selected?.key === key ? selected.idx : 0;
    const idx = (base + dir + g.items.length) % g.items.length;
    setSelected({ key, idx });
    fly(g.items[idx].x, g.items[idx].y);
  };

  const toggleIn = (set: Set<string>, v: string) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    return n;
  };

  return (
    <div className="pm-map-frame anim-up" style={{ animationDelay: "60ms" }}>
      {/* Leaflet adds its classes to the inner box, not the outer one whose classes React changes */}
      <div className={clsx("pm-map", `style-${style}`)}>
        <div ref={elRef} className="absolute inset-0" />
      </div>

      {/* Top left: zone + street */}
      <div className="pm-zone absolute left-[1.6rem] top-[1.2rem] z-[500]">
        <div className="font-display skew-text text-[2.7rem] font-bold leading-none tracking-[0.03em] text-ink">
          {player?.zone || "LOS SANTOS"}
        </div>
        {player?.street ? (
          <div className="font-display mt-[0.35rem] text-[1.05rem] font-semibold tracking-[0.18em] text-accent">{player.street.toLocaleUpperCase(lang())}</div>
        ) : null}
      </div>

      {/* Bottom left: map style */}
      <div className="panel absolute bottom-[1rem] left-[1rem] z-[500] flex">
        {MAP_STYLES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => updateTheme({ mapStyle: m.id })}
            className={clsx("style-chip font-display px-[1rem] py-[0.45rem] text-[0.95rem] font-bold tracking-[0.1em]", style === m.id && "is-active")}
          >
            {t(m.label)}
          </button>
        ))}
      </div>

      <LocationsPanel
        ref={searchRef}
        categories={categories}
        search={search}
        onSearch={setSearch}
        hidden={hidden}
        collapsed={collapsed}
        onToggleHidden={(c) => setHidden((h) => toggleIn(h, c))}
        onToggleCollapsed={(c) => setCollapsed((h) => toggleIn(h, c))}
        selectedKey={selected?.key ?? null}
        instance={selected?.idx ?? 0}
        onSelect={select}
        onCycle={cycle}
        onFocusPlayer={() => player && fly(player.x, player.y, 3.5)}
        onWaypoint={(key) => {
          const g = groups.find((x) => x.key === key);
          if (g) setWaypointAt(g.items[0].x, g.items[0].y);
        }}
      />
    </div>
  );
}
