"use client";

import { useRouter } from "next/navigation";
import { useAthleteName, useAthleteProfile } from "@/lib/useAthlete";
import LiveMetricTiles from "@/components/LiveMetricTiles";
import { type Session, SPORT_BY_ID, SPORT_NAME, relativeDay, useApi } from "@/lib/data";

import BottomNav from "@/components/BottomNav";

import Link from "next/link";

// Generated from design/stitch/sports_hub_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function SportsHub() {
  const router = useRouter();
  const name = useAthleteName();
  const profile = useAthleteProfile();
  const { data: sessions } = useApi<Session[]>("/sessions");
  const live = sessions !== null;
  const latest = (sport: string) =>
    (sessions ?? []).filter((x) => SPORT_BY_ID[x.sport_id] === sport).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const latestTitle = (sport: string) => {
    const l = latest(sport);
    return l ? `${SPORT_NAME[SPORT_BY_ID[l.sport_id]]} Session #${l.id}` : "No sessions yet";
  };
  const latestWhen = (sport: string) => {
    const l = latest(sport);
    return l ? relativeDay(l.recorded_at ?? l.created_at) : "Record one";
  };
  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] pt-safe">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <img alt="Athletic silhouette icon with a subtle glowing cyan/lime duplicate shadow offset mark, symbolizing 'ShadowAthlete' and 'Your only opponent is you'. Brand logo" className="h-8 w-auto object-contain shrink-0" src="https://lh3.googleusercontent.com/aida/AEtjO1U3su2IAJUfImc-QDFIgi5gzTYlDbkzgOVUovo_BNyYGtYNa9qhX4P-2oyefwHVQLhZ1Ab4ChydkqNbQYJ6oFFxL_5J_Qddc6EFgbqZ0J_0WRGiZMLAdr9Zbyj22BuHGThZeOIqyijB8g8KkiHaFQvfwq9-n-bK31wtBSZzAKwsfXkmsWzUb-vNdXU1acb3RA2HpoEFk8GGPHAJO2_JBzWeKHcIe9Wj_ZNrU6FINegMlz-Os5bYSEFdNK0" />
            <div className="flex flex-col truncate">
              <span className="font-headline-md text-body-md text-on-surface tracking-tight uppercase truncate">
                ShadowAthlete
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest truncate">
                Sports
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <Link className="min-w-[44px] min-h-[44px] flex items-center justify-center" data-path="profile" href="/profile">
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-1 ring-secondary-container/40 hover:ring-secondary-container transition-all" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="px-margin-mobile pt-space-md pb-space-lg flex flex-col gap-space-md">
            {/* Hub Title Area */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
                  Sports Hub
                </h1>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                4 Disciplines • 1 Persistent Avatar
              </p>
            </div>
            {/* Sports Stream Stack */}
            <div className="flex flex-col gap-space-md">
              {/* 1. TENNIS (Primary Focus) */}
              <div onClick={() => router.push("/sports/tennis")} className="cursor-pointer flex flex-col rounded-xl bg-surface-container-low shadow-xl overflow-hidden">
                <div className="relative h-36 w-full bg-surface-container">
                  <img className="w-full h-full object-cover" data-alt="A focused female tennis player executing a powerful topspin forehand on a dark indoor hard court, illuminated by cybernetic green and cyan laser telemetry grid lines mapping arm and shoulder joints in dynamic athletic motion." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGKK4Ys867wGK4Fxr6pz2JfUEOp2AGP45P8mnAl5wAViFPoFWi2R3aEFPsVGu4lGlEU7qdYIDK9s-pEXy8-vVjl8ETU6ES57kO0ickxNNgjQwKFrvY2PDKpIFDakkpQEfmwh2aVwIg3j9HB7FF-KnVNuJs2muHLtU2iFsnFvAZijTfuK5ehfoodJGfVfB49gaRdhTles0z8eRzGK5YG5GQQ8D9wd-W-BNZCxVSDKYuJjFgmxOoEh9Z" />
                  {" "}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent"></div>
                  {" "}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                    <span className="font-label-caps text-label-caps text-primary uppercase">
                      Primary Discipline • Level {profile?.level ?? 27}
                    </span>
                  </div>
                  {" "}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">
                          sports_tennis
                        </span>
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
                        Tennis
                      </span>
                    </div>
                    <div className={`${live ? "hidden" : "flex"} flex-col items-end`}>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Kinetic Index
                      </span>
                      <span className="font-metric-large text-metric-large text-primary leading-none">
                        {live ? "—" : 814}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-space-md flex flex-col gap-space-sm">
                  {/* Session Meta Tag */}
                  <div className="flex items-center justify-between text-body-sm text-on-surface-variant bg-surface-container px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        bolt
                      </span>
                      <span className="truncate text-on-surface">
                        {live ? latestTitle("tennis") : "Morning Baseline Forehand"}
                      </span>
                    </div>
                    <span className="shrink-0 font-label-caps text-label-caps uppercase text-outline">
                      {live ? latestWhen("tennis") : "Yesterday"}
                    </span>
                  </div>
                  {/* Live Metrics Grid */}
                  {live ? (
                    <LiveMetricTiles sport="tennis" sessions={sessions ?? []} />
                  ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Action Split
                      </span>
                      <span className="font-label-badge text-label-badge text-on-surface mt-1">
                        FH • BH • Serve
                      </span>
                      <span className="font-label-caps text-label-caps text-primary mt-0.5">
                        Multi-Class
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Coverage
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        99.1%
                      </span>
                      <span className="font-label-caps text-label-caps text-secondary-fixed-dim mt-auto">
                        Mesh Locked
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Joint Angles
                      </span>
                      <span className="font-label-badge text-label-badge text-on-surface mt-1">
                        E: 142° • K: 128°
                      </span>
                      <span className="font-label-caps text-label-caps text-primary mt-0.5">
                        +4° vs Shadow
                      </span>
                    </div>
                  </div>
                  )}
                  {/* Video Capture Triggers */}
                  <div className="grid grid-cols-2 gap-space-xs pt-1">
                    <button className="min-h-[44px] px-3 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-md text-body-md flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture?sport=tennis"); }}>
                      <span className="material-symbols-outlined text-[18px]">
                        videocam
                      </span>
                      <span>
                        Record
                      </span>
                    </button>
                    <button className="min-h-[44px] px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface font-headline-md text-body-md flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture/upload?sport=tennis"); }}>
                      <span className="material-symbols-outlined text-[18px]">
                        file_upload
                      </span>
                      <span>
                        Upload
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {/* 2. CRICKET: FAST BOWLING (Secondary Focus) */}
              <div className="flex flex-col rounded-xl bg-surface-container-low shadow-xl overflow-hidden">
                <div className="relative h-32 w-full bg-surface-container">
                  <img className="w-full h-full object-cover" data-alt="A male cricket fast bowler in mid-bound delivery stride on a grass pitch, explosive power highlighted by dynamic cyan wireframe vector traces around the shoulder joint, locked front knee, and release wrist at high velocity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaEnvl0S89QhPuFSl6uNKePet6Hf_MuVW1oMpXl_LoCU-fKR103WFgJE_LXB9XPDC_BHe8tYOj0TDr93fZd58EO6SWR6tIBOZMMiZYBn9fBhrtvd0t8N_L9EQUr4L35H5tyJ4jLqg9_JYmyRt3jOePhaOBCO9ws1G2gxsa_rF0IRiMPBehnPI7z15Z2gddV0fwVlyYFx8DKbqGKLUmbBIgw2NfXZFa5rEuv9W1V5B4Ux0IdTe7V1o5" />
                  {" "}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent"></div>
                  {" "}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span>
                    <span className="font-label-caps text-label-caps text-secondary-fixed-dim uppercase">
                      Secondary Discipline
                    </span>
                  </div>
                  {" "}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[18px]">
                          sports_cricket
                        </span>
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
                        Cricket Pace
                      </span>
                    </div>
                    <div className={`${live ? "hidden" : "flex"} flex-col items-end`}>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Index
                      </span>
                      <span className="font-metric-large text-metric-large text-secondary-fixed-dim leading-none">
                        {live ? "—" : 775}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between text-body-sm text-on-surface-variant bg-surface-container px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[16px] text-secondary-fixed-dim">
                        speed
                      </span>
                      <span className="truncate text-on-surface">
                        {live ? latestTitle("cricket") : "Pace Nets Run-up"}
                      </span>
                    </div>
                    <span className="shrink-0 font-label-caps text-label-caps uppercase text-outline">
                      {live ? latestWhen("cricket") : "3 days ago"}
                    </span>
                  </div>
                  {live ? (
                    <LiveMetricTiles sport="cricket" sessions={sessions ?? []} />
                  ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Run-up Speed
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        28.4{" "}
                        <span className="font-body-sm text-body-sm text-outline">
                          km/h
                        </span>
                      </span>
                      <span className="font-label-caps text-label-caps text-primary mt-auto">
                        Peak Cadence
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Stride Lock
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        0.18s
                      </span>
                      <span className="font-label-caps text-label-caps text-secondary-fixed-dim mt-auto">
                        Locked
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Brace Angle
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        164°
                      </span>
                      <span className="font-label-caps text-label-caps text-tertiary-fixed-dim mt-auto">
                        Optimal
                      </span>
                    </div>
                  </div>
                  )}
                  <div className="grid grid-cols-2 gap-space-xs pt-1">
                    <button className="min-h-[44px] px-3 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-md text-body-md flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture?sport=cricket"); }}>
                      <span className="material-symbols-outlined text-[18px]">
                        videocam
                      </span>
                      <span>
                        Record
                      </span>
                    </button>
                    <button className="min-h-[44px] px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface font-headline-md text-body-md flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture/upload?sport=cricket"); }}>
                      <span className="material-symbols-outlined text-[18px]">
                        file_upload
                      </span>
                      <span>
                        Upload
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {/* 3. BASKETBALL */}
              <div className="flex flex-col rounded-xl bg-surface-container-low shadow-xl overflow-hidden">
                <div className="relative h-32 w-full bg-surface-container">
                  <img className="w-full h-full object-cover" data-alt="A modern basketball player elevated at the apex of a jump shot inside a high-tech training arena, shot trajectory and elbow vertical alignment corridor drawn as luminous cyan telemetry vector lines." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaqzuZz_1z-uL1IRp9uw8ph4EwutRszfTxi4zgZX4gcPxH9ZtMbhj5iawpvvnxjIhVVGR4sv6a5_QREEm_CZqC5BXiZAKXvmhfXNFQEZRLMYEaM0_3iPZIszhnymMDzXE6ul9eYtfkJ6Kc_5ZMjnpTv2r9k9d-2o7zhx4IK2ck8A5INy9fVPkXW-vkKfRZKFsM3eVW6wa5Ec10yuzaaLXKPmPSi_8b5BVmrIbqtSXpy4O_LgxPQJyf" />
                  {" "}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent"></div>
                  {" "}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-outline"></span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      Active Discipline
                    </span>
                  </div>
                  {" "}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-[18px]">
                          sports_basketball
                        </span>
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
                        Basketball
                      </span>
                    </div>
                    <div className={`${live ? "hidden" : "flex"} flex-col items-end`}>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Index
                      </span>
                      <span className="font-metric-large text-metric-large text-on-surface leading-none">
                        {live ? "—" : 740}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between text-body-sm text-on-surface-variant bg-surface-container px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        sports_score
                      </span>
                      <span className="truncate text-on-surface">
                        {live ? latestTitle("basketball") : "Jump Shot Free Throw Arc"}
                      </span>
                    </div>
                    <span className="shrink-0 font-label-caps text-label-caps uppercase text-outline">
                      {live ? latestWhen("basketball") : "5 days ago"}
                    </span>
                  </div>
                  {live ? (
                    <LiveMetricTiles sport="basketball" sessions={sessions ?? []} />
                  ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Release Pt
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        2.48{" "}
                        <span className="font-body-sm text-body-sm text-outline">
                          m
                        </span>
                      </span>
                      <span className="font-label-caps text-label-caps text-primary mt-auto">
                        +0.04m Max
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Elbow Corridor
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        91.2°
                      </span>
                      <span className="font-label-caps text-label-caps text-secondary-fixed-dim mt-auto">
                        Inline
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Jump Balance
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        96%
                      </span>
                      <span className="font-label-caps text-label-caps text-primary mt-auto">
                        Symmetric
                      </span>
                    </div>
                  </div>
                  )}
                  <div className="grid grid-cols-2 gap-space-xs pt-1">
                    <button className="min-h-[44px] px-3 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-md text-body-md flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture?sport=basketball"); }}>
                      <span className="material-symbols-outlined text-[18px]">
                        videocam
                      </span>
                      <span>
                        Record
                      </span>
                    </button>
                    <button className="min-h-[44px] px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface font-headline-md text-body-md flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture/upload?sport=basketball"); }}>
                      <span className="material-symbols-outlined text-[18px]">
                        file_upload
                      </span>
                      <span>
                        Upload
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {/* 4. RUNNING */}
              <div className="flex flex-col rounded-xl bg-surface-container-low shadow-xl overflow-hidden">
                <div className="relative h-32 w-full bg-surface-container">
                  <img className="w-full h-full object-cover" data-alt="A track runner sprinting forward along an all-weather athletic track at dusk, with foot strike pressure nodes and neon green cadence rhythm indicators synced with a cyan ghost overlay trailing behind." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAarzrYOBkujXT7ykJa82cJNlB5L7KxJ_JQhG1Ip4XdQMQsLK18URXp_wQVw3Nx1nXdhb0fOoN5IftNkZ94KvGFXERjRahdb0MLuakA3FAY7hsfjgriy3rLJMgVEXntzuSexf7gnTC1GdY7h1NHgJ17m5_3F_CskIWvbEK3sjJvEB7WXcyvUqF-_33VMM0iQwhl_ZcgD0xbZkHvt-I4CciZL5C61_7uD1sKhVkj6BWv_cjPxOgSqrK9" />
                  {" "}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent"></div>
                  {" "}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-outline"></span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      Active Discipline
                    </span>
                  </div>
                  {" "}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">
                          directions_run
                        </span>
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
                        Running
                      </span>
                    </div>
                    <div className={`${live ? "hidden" : "flex"} flex-col items-end`}>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Index
                      </span>
                      <span className="font-metric-large text-metric-large text-primary leading-none">
                        {live ? "—" : 805}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-space-md flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between text-body-sm text-on-surface-variant bg-surface-container px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        sprint
                      </span>
                      <span className="truncate text-on-surface">
                        {live ? latestTitle("running") : "5K Tempo Stride"}
                      </span>
                    </div>
                    <span className="shrink-0 font-label-caps text-label-caps uppercase text-outline">
                      {live ? latestWhen("running") : "Last week"}
                    </span>
                  </div>
                  {live ? (
                    <LiveMetricTiles sport="running" sessions={sessions ?? []} />
                  ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Cadence
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        176{" "}
                        <span className="font-body-sm text-body-sm text-outline">
                          spm
                        </span>
                      </span>
                      <span className="font-label-caps text-label-caps text-primary mt-auto">
                        Shadow +2
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        GCT Symmetry
                      </span>
                      <span className="font-label-badge text-label-badge text-on-surface mt-1">
                        50.4 / 49.6
                      </span>
                      <span className="font-label-caps text-label-caps text-secondary-fixed-dim mt-0.5">
                        Near-Zero Drift
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">
                        Strike Angle
                      </span>
                      <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                        Midfoot
                      </span>
                      <span className="font-label-caps text-label-caps text-primary mt-auto">
                        Clean Load
                      </span>
                    </div>
                  </div>
                  )}
                  <div className="grid grid-cols-2 gap-space-xs pt-1">
                    <button className="min-h-[44px] px-3 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-headline-md text-body-md flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture?sport=running"); }}>
                      <span className="material-symbols-outlined text-[18px]">
                        videocam
                      </span>
                      <span>
                        Record
                      </span>
                    </button>
                    <button className="min-h-[44px] px-3 py-2.5 rounded-lg bg-surface-container-highest text-on-surface font-headline-md text-body-md flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture/upload?sport=running"); }}>
                      <span className="material-symbols-outlined text-[18px]">
                        file_upload
                      </span>
                      <span>
                        Upload
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
