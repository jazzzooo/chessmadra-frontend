import client from "app/client";
import {
  PlayerTemplate,
  RepertoireTemplate,
  PositionReport,
  EcoCode,
  PawnStructureDetails,
  LineReport,
} from "app/models";
import {
  dropRight,
  isEmpty,
  keyBy,
  last,
  some,
  forEach,
  filter,
  flatten,
  values,
  sortBy,
  capitalize,
  isNil,
} from "lodash-es";
import {
  BySide,
  getAllRepertoireMoves,
  lineToPgn,
  Repertoire,
  RepertoireGrade,
  RepertoireMove,
  RepertoireSide,
  Side,
  sideOfLastmove,
} from "./repertoire";
import { START_EPD } from "./chess";
import { AppState, quick } from "./app_state";
import { StateGetter, StateSetter } from "./state_setters_getters";
import { createQuick } from "./quick";
import {
  BrowsingMode,
  BrowsingState,
  getInitialBrowsingState,
  makeDefaultSidebarState,
  SidebarOnboardingStage,
} from "./browsing_state";
import { getPawnOnlyEpd, reversePawnEpd } from "./pawn_structures";
import { getInitialReviewState, ReviewState } from "./review_state";
let NUM_MOVES_DEBUG_PAWN_STRUCTURES = 10;
import pkceChallenge from "pkce-challenge";
import { logProxy } from "./state";
import { failOnAny } from "./test_settings";
import { isDevelopment } from "./env";
import { shouldDebugEpd } from "./debug";
import { Animated, Easing } from "react-native";
import { Responsive } from "./useResponsive";

const TEST_LINE = isDevelopment ? [] : [];
const TEST_MODE: BrowsingMode = isDevelopment ? null : null;
// const TEST_LINE = null;

export interface LichessOauthData {
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
  codeChallenge: string;
}

export enum AddLineFromOption {
  Initial = "Start Position",
  Current = "Current Position",
  BiggestMiss = "Biggest Gap in Repertoire",
  BiggestMissOpening = "Biggest Gap in Opening",
}

export interface RepertoireState {
  lineReports: Record<string, LineReport>;
  numMovesFromEpd: BySide<Record<string, number>>;
  numMovesDueFromEpd: BySide<Record<string, number>>;
  earliestReviewDueFromEpd: BySide<Record<string, string>>;
  expectedNumMovesFromEpd: BySide<Record<string, number>>;
  quick: (fn: (_: RepertoireState) => void) => void;
  repertoire: Repertoire;
  numResponsesAboveThreshold: BySide<number>;
  positionReports: BySide<Record<string, PositionReport>>;
  failedToFetchSharedRepertoire?: boolean;
  repertoireGrades: BySide<RepertoireGrade>;
  repertoireShareId?: string;
  fetchSharedRepertoire: (id: string) => void;
  fetchRepertoire: (initial?: boolean) => void;
  startLichessOauthFlow: () => void;
  fetchEcoCodes: () => void;
  fetchSupplementary: () => Promise<void>;
  fetchRepertoireTemplates: () => void;
  fetchPlayerTemplates: () => void;
  initializeRepertoire: (_: {
    lichessUsername?: string;
    whitePgn?: string;
    blackPgn?: string;
    state?: RepertoireState;
    responsive: Responsive;
  }) => void;
  initState: () => void;
  // TODO: move review state stuff to its own module
  usePlayerTemplate: (id: string, responsive: Responsive) => void;
  backToOverview: () => void;
  uploadMoveAnnotation: ({
    epd,
    san,
    text,
  }: {
    epd: string;
    san: string;
    text: string;
  }) => void;
  startBrowsing: (
    side: Side,
    mode: BrowsingMode,
    options?: { pgnToPlay?: string; import?: boolean }
  ) => void;
  animateChessboardShown: (
    responsive: Responsive,
    animateIn: boolean,
    cb: () => void
  ) => void;
  showImportView?: boolean;
  startImporting: (side: Side) => void;
  updateRepertoireStructures: () => void;
  epdIncidences: BySide<Record<string, number>>;
  epdNodes: BySide<Record<string, boolean>>;
  onMove: () => void;
  getMyResponsesLength: (side?: Side) => number;
  getNumResponsesBelowThreshold: (threshold: number, side: Side) => number;
  getLineCount: (side?: Side) => number;
  getIsRepertoireEmpty: (side?: Side) => boolean;
  analyzeLineOnLichess: (line: string[], side?: Side) => void;
  analyzeMoveOnLichess: (fen: string, move: string, turn: Side) => void;
  backOne: () => void;
  backToStartPosition: () => void;
  deleteRepertoire: (side: Side) => void;
  deleteMove: (response: RepertoireMove) => Promise<void>;
  trimRepertoire: (threshold: number, sides: Side[]) => Promise<void>;
  exportPgn: (side: Side) => void;
  addTemplates: () => void;
  onRepertoireUpdate: () => void;
  editingSide?: Side;
  myResponsesLookup?: BySide<RepertoireMove[]>;
  moveLookup?: BySide<Record<string, RepertoireMove>>;
  currentLine?: string[];
  hasCompletedRepertoireInitialization?: boolean;
  repertoireTemplates?: RepertoireTemplate[];
  playerTemplates?: PlayerTemplate[];
  selectedTemplates: Record<string, string>;
  conflictingId?: string;
  // The first position where the user does not have a response for
  divergencePosition?: string;
  divergenceIndex?: number;
  ecoCodes: EcoCode[];
  pawnStructures: PawnStructureDetails[];
  ecoCodeLookup: Record<string, EcoCode>;
  pawnStructureLookup: Record<string, PawnStructureDetails>;
  browsingState: BrowsingState;
  reviewState: ReviewState;
  deleteMoveState: {
    modalOpen: boolean;
    response?: RepertoireMove;
    isDeletingMove: boolean;
  };
  updateShareLink: () => void;
  //
  overviewState: {
    isShowingShareModal: boolean;
  };

  repertoireSettingsModalSide?: Side;
  // Nav bar stuff
  getBreadCrumbs: () => NavBreadcrumb[];

  // Debug pawn structure stuff
  debugPawnStructuresState: any & {};
  fetchDebugGames: () => void;
  // fetchDebugPawnStructureForPosition: () => void;
  selectDebugGame: (i: number) => void;
}

export interface NavBreadcrumb {
  text: string;
  onPress?: () => void;
}

export interface AddNewLineChoice {
  title: string;
  line: string;
  active?: boolean;
  incidence?: number;
}

export enum AddedLineStage {
  Initial,
  AddAnother,
}

export interface FetchRepertoireResponse {
  repertoire: Repertoire;
  grades: BySide<RepertoireGrade>;
  shareId: string;
}

interface GetSharedRepertoireResponse {
  repertoire: Repertoire;
}

export const DEFAULT_ELO_RANGE = [1300, 1500] as [number, number];

type Stack = [RepertoireState, AppState];
const selector = (s: AppState): Stack => [s.repertoireState, s];

export const getInitialRepertoireState = (
  _set: StateSetter<AppState, any>,
  _get: StateGetter<AppState, any>
) => {
  const set = <T,>(fn: (stack: Stack) => T, id?: string): T => {
    return _set((s) => fn(selector(s)));
  };
  const setOnly = <T,>(fn: (stack: RepertoireState) => T, id?: string): T => {
    return _set((s) => fn(s.repertoireState));
  };
  const get = <T,>(fn: (stack: Stack) => T, id?: string): T => {
    return _get((s) => fn(selector(s)));
  };
  let initialState = {
    ...createQuick<RepertoireState>(setOnly),
    chessboardState: null,
    expectedNumMoves: { white: 0, black: 0 },
    numMovesFromEpd: { white: {}, black: {} },
    numMovesDueFromEpd: { white: {}, black: {} },
    earliestReviewDueFromEpd: { white: {}, black: {} },
    expectedNumMovesFromEpd: { white: {}, black: {} },
    // All epds that are covered or arrived at (epd + epd after)
    epdNodes: { white: {}, black: {} },
    epdIncidences: { white: {}, black: {} },
    deleteMoveState: {
      modalOpen: false,
      isDeletingMove: false,
    },
    ecoCodes: [],
    debugPawnStructuresState: null,
    addedLineState: null,
    isAddingPendingLine: false,
    numResponsesAboveThreshold: null,
    pawnStructures: [],
    isUpdatingEloRange: false,
    repertoire: undefined,
    browsingState: getInitialBrowsingState(_set, _get),
    reviewState: getInitialReviewState(_set, _get),
    overviewState: {
      isShowingShareModal: false,
    },
    repertoireGrades: { white: null, black: null },
    ecoCodeLookup: {},
    pawnStructureLookup: {},
    pendingResponses: {},
    positionReports: { white: {}, black: {} },
    lineReports: {},
    currentLine: [],
    // hasCompletedRepertoireInitialization: failOnTrue(true),
    initState: () =>
      set(([s]) => {
        s.fetchRepertoire(true);
        s.fetchSupplementary();
      }, "initState"),
    usePlayerTemplate: (id: string, responsive: Responsive) =>
      set(async ([s]) => {
        let { data }: { data: FetchRepertoireResponse } = await client.post(
          "/api/v1/openings/use_player_template",
          {
            id,
          }
        );
        set(([s]) => {
          s.repertoire = data.repertoire;
          s.repertoireGrades = data.grades;
          s.onRepertoireUpdate();
          s.browsingState.finishSidebarOnboarding(responsive);
        });
      }, "usePlayerTemplate"),
    addTemplates: () =>
      set(async ([s]) => {
        let { data }: { data: FetchRepertoireResponse } = await client.post(
          "/api/v1/openings/add_templates",
          {
            templates: Object.values(s.selectedTemplates),
          }
        );
        set(([s]) => {
          s.repertoire = data.repertoire;
          s.repertoireGrades = data.grades;
          s.onRepertoireUpdate();
          s.backToOverview();
          s.hasCompletedRepertoireInitialization = true;
        });
      }, "addTemplates"),
    initializeRepertoire: ({
      lichessUsername,
      blackPgn,
      whitePgn,
      responsive,
    }) =>
      set(async ([s]) => {
        let lichessGames = [];
        let chessComGames = [];
        if (lichessUsername) {
          let max = 200;
          let { data }: { data: string } = await client.get(
            `https://lichess.org/api/games/user/${encodeURIComponent(
              lichessUsername
            )}?max=${max}`,
            {
              headers: { Accept: "application/x-ndjson" },
            }
          );
          lichessGames = data
            .split("\n")
            .filter((s) => s.length > 2)
            .map((s) => JSON.parse(s));
        }
        let { data }: { data: FetchRepertoireResponse } = await client.post(
          "/api/v1/initialize_repertoire",
          {
            lichessGames,
            lichessUsername,
            chessComGames,
            whitePgn,
            blackPgn,
          }
        );
        set(([s]) => {
          s.repertoire = data.repertoire;
          s.repertoireGrades = data.grades;
          s.onRepertoireUpdate();
          let minimumToTrim = 10;
          let side: Side = blackPgn ? "black" : "white";
          let numBelowThreshold = s.getNumResponsesBelowThreshold(
            1 / 100,
            side
          );
          if (side && numBelowThreshold > minimumToTrim) {
            s.browsingState.sidebarState.sidebarOnboardingState.stageStack.push(
              SidebarOnboardingStage.TrimRepertoire
            );
          } else {
            s.browsingState.finishSidebarOnboarding(responsive);
          }
        }, "initializeRepertoire");
      }),
    getBreadCrumbs: () =>
      set(([s]) => {
        const homeBreadcrumb = {
          text: "Openings",
          onPress: () => {
            set(([s, appState]) => {
              s.backToOverview();
            });
          },
        };

        let breadcrumbs = [homeBreadcrumb];
        let mode = s.browsingState.sidebarState.mode;
        let side = s.browsingState.sidebarState.activeSide;
        if (side) {
          breadcrumbs.push({
            text: capitalize(side),
            onPress: () => {
              quick((s) => {
                s.repertoireState.startBrowsing(side, "overview");
              });
            },
          });
        }
        if (mode && mode !== "overview") {
          breadcrumbs.push({
            text: capitalize(mode),
            onPress: () => {
              quick((s) => {
                s.repertoireState.startBrowsing(side, mode);
              });
            },
          });
        }
        return breadcrumbs;
      }),
    updateShareLink: () =>
      set(([s]) => {
        client.post(`/api/v1/openings/update-share-link`).then(({ data }) => {
          set(([s]) => {
            s.repertoireShareId = data.id;
          });
        });
      }),
    analyzeMoveOnLichess: (fen: string, move: string, turn: Side) =>
      set(([s]) => {
        var bodyFormData = new FormData();
        bodyFormData.append(
          "pgn",
          `
          [Variant "From Position"]
          [FEN "${fen}"]

          ${turn === "white" ? "1." : "1..."} ${move}
        `
        );
        var windowReference = window.open("about:blank", "_blank");
        client
          .post(`https://lichess.org/api/import`, bodyFormData)
          .then(({ data }) => {
            let url = data["url"];
            windowReference.location = `${url}/${turn}#999`;
          });
      }),
    analyzeLineOnLichess: (line: string[], _side?: Side) =>
      set(([s]) => {
        var bodyFormData = new FormData();
        bodyFormData.append("pgn", lineToPgn(line));
        if (isEmpty(line)) {
          // TODO: figure out a way to open up analysis from black side
          window.open(`https://lichess.org/analysis`, "_blank");
          return;
        }
        var windowReference = window.open("about:blank", "_blank");
        let side = _side ?? sideOfLastmove(line);
        client
          .post(`https://lichess.org/api/import`, bodyFormData)
          .then(({ data }) => {
            let url = data["url"];
            windowReference.location = `${url}/${side}#${line.length}`;
          });
      }),
    onMove: () =>
      set(([s]) => {
        if (s.debugPawnStructuresState) {
          // s.fetchDebugPawnStructureForPosition();
        }
      }, "onMove"),
    updateRepertoireStructures: () =>
      set(([s, gs]) => {
        let threshold = gs.userState.getCurrentThreshold();
        mapSides(s.repertoire, (repertoireSide: RepertoireSide, side: Side) => {
          let seenEpds: Set<string> = new Set();
          let numMovesByEpd = {};
          let recurse = (
            epd: string,
            seenEpds: Set<string>,
            lastMove: RepertoireMove
          ) => {
            if (shouldDebugEpd(epd)) {
              console.log(
                "[updateRepertoireStructures], this is bting debugged",
                epd
              );
            }
            if (seenEpds.has(epd)) {
              return { numMoves: 0, additionalExpectedNumMoves: 0 };
            }
            let incidence = lastMove?.incidence ?? 1;
            let totalNumMovesFromHere = 0;
            let newSeenEpds = new Set(seenEpds);
            newSeenEpds.add(epd);
            let allMoves = filter(
              repertoireSide.positionResponses[epd] ?? [],
              (m) => m.needed
            );
            let [mainMove, ...others] = allMoves;
            let additionalExpectedNumMoves = 0;
            if (mainMove?.mine && !isEmpty(others)) {
              others.forEach((m) => {
                let additional = getExpectedNumMovesBetween(
                  m.incidence,
                  threshold
                );
                additionalExpectedNumMoves += additional;
              });
            }
            let numMovesExpected = getExpectedNumMovesBetween(
              incidence,
              threshold
            );
            let childAdditionalMovesExpected = 0;
            allMoves.forEach((m) => {
              if (shouldDebugEpd(epd)) {
                console.log("MOVES", m);
              }
              let { numMoves, additionalExpectedNumMoves } = recurse(
                m.epdAfter,
                newSeenEpds,
                m
              );
              numMovesExpected += additionalExpectedNumMoves;
              childAdditionalMovesExpected += additionalExpectedNumMoves;
              totalNumMovesFromHere += numMoves;
            });
            numMovesByEpd[epd] = totalNumMovesFromHere;
            s.expectedNumMovesFromEpd[side][epd] = numMovesExpected;
            s.numMovesFromEpd[side][epd] = totalNumMovesFromHere;
            return {
              numMoves: totalNumMovesFromHere + (incidence > threshold ? 1 : 0),
              additionalExpectedNumMoves:
                additionalExpectedNumMoves + childAdditionalMovesExpected,
            };
          };
          recurse(START_EPD, seenEpds, null);
        });
        mapSides(s.repertoire, (repertoireSide: RepertoireSide, side: Side) => {
          let seenEpds: Set<string> = new Set();
          let recurse = (
            epd: string,
            seenEpds: Set<string>,
            lastMove: RepertoireMove
          ) => {
            if (shouldDebugEpd(epd)) {
              console.log(
                "[updateRepertoireStructures], this is bting debugged",
                epd
              );
            }
            if (seenEpds.has(epd)) {
              return { dueMoves: 0, earliestDueDate: null };
            }
            let newSeenEpds = new Set(seenEpds);
            newSeenEpds.add(epd);
            let earliestDueDate = null;
            let allMoves = repertoireSide.positionResponses[epd] ?? [];
            let dueMovesFromHere = 0;
            allMoves.forEach((m) => {
              if (shouldDebugEpd(epd)) {
                console.log("MOVES", m);
              }
              let { dueMoves, earliestDueDate: recursedEarliestDueDate } =
                recurse(m.epdAfter, newSeenEpds, m);
              if (
                (earliestDueDate === null && recursedEarliestDueDate) ||
                recursedEarliestDueDate < earliestDueDate
              ) {
                earliestDueDate = recursedEarliestDueDate;
              }
              dueMovesFromHere += dueMoves;
            });
            s.numMovesDueFromEpd[side][epd] = dueMovesFromHere;
            s.earliestReviewDueFromEpd[side][epd] = earliestDueDate;
            if (shouldDebugEpd(epd)) {
              console.log("earliestDueDate", earliestDueDate);
            }
            let due = lastMove?.srs?.needsReview;
            return {
              dueMoves: dueMovesFromHere + (due ? 1 : 0),
              earliestDueDate: earliestDueDate ?? lastMove?.srs?.dueAt,
            };
          };
          recurse(START_EPD, seenEpds, null);
        });
        s.myResponsesLookup = mapSides(
          s.repertoire,
          (repertoireSide: RepertoireSide) => {
            return flatten(
              Object.values(repertoireSide.positionResponses)
            ).filter((m: RepertoireMove) => m.mine);
          }
        );
        s.epdNodes = mapSides(
          s.repertoire,
          (repertoireSide: RepertoireSide) => {
            let nodeEpds = {};
            let allEpds = flatten(
              Object.values(repertoireSide.positionResponses)
            ).flatMap((m) => [m.epd, m.epdAfter]);
            allEpds.forEach((epd) => {
              nodeEpds[epd] = true;
            });
            return nodeEpds;
          }
        );
        s.numResponsesAboveThreshold = mapSides(
          s.repertoire,
          (repertoireSide: RepertoireSide) => {
            return flatten(
              Object.values(repertoireSide.positionResponses)
            ).filter((m) => m.needed).length;
          }
        );
      }, "updateRepertoireStructures"),

    trimRepertoire: (threshold: number, sides: Side[]) =>
      set(([s]) => {
        return client
          .post("/api/v1/openings/trim", {
            threshold,
            sides,
          })
          .then(({ data }: { data: FetchRepertoireResponse }) => {
            set(([s]) => {
              s.repertoire = data.repertoire;
              s.repertoireGrades = data.grades;
              s.onRepertoireUpdate();
              if (s.browsingState.sidebarState.mode !== "review") {
                s.browsingState.onPositionUpdate();
              }
            });
          })
          .finally(() => {});
      }, "deleteMoveConfirmed"),
    deleteMove: (response: RepertoireMove) =>
      set(([s]) => {
        s.deleteMoveState.isDeletingMove = true;
        return client
          .post("/api/v1/openings/delete_move", {
            response: response,
          })
          .then(({ data }: { data: FetchRepertoireResponse }) => {
            set(([s]) => {
              s.repertoire = data.repertoire;
              s.repertoireGrades = data.grades;
              s.onRepertoireUpdate();
              if (s.browsingState.sidebarState.mode !== "review") {
                s.browsingState.onPositionUpdate();
              }
            });
          })
          .finally(() => {
            set(([s]) => {
              s.deleteMoveState.isDeletingMove = false;
              s.deleteMoveState.response = null;
              s.deleteMoveState.modalOpen = false;
            });
          });
      }, "deleteMoveConfirmed"),
    deleteRepertoire: (side: Side) =>
      set(([s]) => {
        client
          .post("/api/v1/openings/delete", {
            sides: [side],
          })
          .then(({ data }: { data: FetchRepertoireResponse }) => {
            set(([s]) => {
              s.repertoire = data.repertoire;
              s.repertoireGrades = data.grades;
              s.onRepertoireUpdate();
            });
          });
      }, "deleteRepertoire"),
    exportPgns: () => set(([s]) => {}),
    exportPgn: (side: Side) =>
      set(([s]) => {
        let pgn = "";

        let seenEpds = new Set();
        let recurse = (epd, line, seenEpds) => {
          let [mainMove, ...others] =
            s.repertoire[side].positionResponses[epd] ?? [];
          let newSeenEpds = new Set(seenEpds);
          newSeenEpds.add(epd);
          if (!mainMove) {
            return;
          }
          let mainLine = [...line, mainMove.sanPlus];
          pgn = pgn + getLastMoveWithNumber(lineToPgn(mainLine)) + " ";
          forEach(others, (variationMove) => {
            if (seenEpds.has(variationMove.epdAfter)) {
              return;
            }
            let variationLine = [...line, variationMove.sanPlus];
            seenEpds.add(variationMove.epdAfter);
            pgn += "(";
            if (sideOfLastmove(variationLine) === "black") {
              let n = Math.floor(variationLine.length / 2);

              pgn +=
                `${n}... ` +
                getLastMoveWithNumber(lineToPgn(variationLine)).trim() +
                " ";
            } else {
              pgn += getLastMoveWithNumber(lineToPgn(variationLine)) + " ";
            }

            recurse(variationMove.epdAfter, variationLine, seenEpds);
            pgn = pgn.trim();
            pgn += ") ";
          });
          if (seenEpds.has(mainMove.epdAfter)) {
            return;
          }
          if (
            !isEmpty(others) &&
            sideOfLastmove(lineToPgn(mainLine)) === "white"
          ) {
            pgn += `${getMoveNumber(lineToPgn(mainLine))}... `;
          }

          seenEpds.add(mainMove.epdAfter);
          recurse(mainMove.epdAfter, mainLine, seenEpds);
        };
        recurse(START_EPD, [], seenEpds);
        pgn = pgn.trim();

        let downloadLink = document.createElement("a");

        let csvFile = new Blob([pgn], { type: "text" });

        let url = window.URL.createObjectURL(csvFile);
        downloadLink.download = `${side}.pgn`;
        downloadLink.href = url;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
      }, "exportPgn"),

    getPawnStructure: (epd: string) =>
      get(([s]) => {
        let pawnEpd = getPawnOnlyEpd(epd);
        let pawnStructure = s.pawnStructureLookup[pawnEpd];
        if (pawnStructure) {
          return { reversed: false, pawnStructure };
        }
        let reversed = reversePawnEpd(pawnEpd);
        pawnStructure = s.pawnStructureLookup[reversed];
        if (pawnStructure) {
          return { reversed: true, pawnStructure };
        }
        return {};
      }),
    uploadMoveAnnotation: ({
      epd,
      san,
      text,
    }: {
      epd: string;
      san: string;
      text: string;
    }) =>
      get(([s]) => {
        client
          .post("/api/v1/openings/move_annotation", {
            text: text,
            epd: epd,
            san,
          })
          .then(({ data }: { data: any }) => {
            set(([s]) => {
              s.positionReports[s.browsingState.sidebarState.activeSide][
                epd
              ]?.suggestedMoves?.forEach((sm) => {
                if (sm.sanPlus === san) {
                  sm.annotation = text;
                }
              });
              s.browsingState.onPositionUpdate();
            });
          });
      }),
    backToOverview: () =>
      set(([s, gs]) => {
        console.log("back to overview");
        gs.navigationState.push("/");
        if (s.browsingState.sidebarState.mode == "review") {
          s.reviewState.stopReviewing();
        }
        s.showImportView = false;
        s.backToStartPosition();
        s.browsingState.sidebarState.activeSide = null;
        s.divergencePosition = null;
        s.divergenceIndex = null;
        s.browsingState.sidebarState = makeDefaultSidebarState();
      }),
    startImporting: (side: Side) =>
      set(([s]) => {
        s.startBrowsing(side, "build", { import: true });
        s.browsingState.chessboardState.resetPosition();
        s.browsingState.sidebarState.sidebarOnboardingState.stageStack = [
          SidebarOnboardingStage.ChooseImportSource,
        ];
      }, "startImporting"),
    animateChessboardShown: (
      responsive: Responsive,
      animateIn: boolean,
      cb: () => void
    ) =>
      set(([s, gs]) => {
        if (responsive.isMobile) {
          Animated.sequence([
            Animated.timing(s.browsingState.chessboardShownAnim, {
              toValue: animateIn ? 1 : 0,
              duration: 400,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.ease),
            }),
          ]).start((r) => {
            cb();
          });
        } else {
          cb();
        }
      }),
    startBrowsing: (
      side: Side,
      mode: BrowsingMode,
      options?: { pgnToPlay?: string; import?: boolean }
    ) =>
      set(([s, gs]) => {
        console.log("start browsing", side, mode);
        const currentMode = s.browsingState.sidebarState.mode;

        if (currentMode && mode === "overview") {
          s.browsingState.moveSidebarState("left");
        } else if (mode && currentMode === "overview") {
          s.browsingState.moveSidebarState("right");
        }
        s.browsingState.sidebarState.sidebarOnboardingState.stageStack = [];
        s.browsingState.sidebarState.mode = mode;
        s.browsingState.sidebarState.activeSide = side;
        s.browsingState.onPositionUpdate();
        s.browsingState.chessboardState.flipped =
          s.browsingState.sidebarState.activeSide === "black";
        if (options?.import) {
          // just don't show the chessboard
        } else if (s.getIsRepertoireEmpty(side) && mode === "build") {
          s.browsingState.chessboardShownAnim.setValue(0);
          s.browsingState.sidebarState.sidebarOnboardingState.stageStack = [
            SidebarOnboardingStage.AskAboutExistingRepertoire,
          ];
        } else if (mode === "browse" || mode === "build") {
          s.browsingState.chessboardShownAnim.setValue(1);
          if (s.browsingState.sidebarState.activeSide === "white") {
            let startResponses =
              s.repertoire?.[s.browsingState.sidebarState.activeSide]
                ?.positionResponses[START_EPD];
            if (startResponses?.length === 1) {
              s.browsingState.chessboardState.makeMove(
                startResponses[0].sanPlus
              );
            }
          }
          if (options?.pgnToPlay) {
            s.browsingState.chessboardState.playPgn(options.pgnToPlay);
          }
        } else if (mode === "overview") {
          s.browsingState.chessboardShownAnim.setValue(0);
        }
        gs.navigationState.push(`/openings/${side}/${mode}`);
      }, "startBrowsing"),
    onRepertoireUpdate: () =>
      set(([s]) => {
        s.updateRepertoireStructures();
        s.browsingState.fetchNeededPositionReports();
        s.browsingState.updateRepertoireProgress();
        s.browsingState.updateTableResponses();
      }),
    fetchRepertoireTemplates: () =>
      set(([s]) => {
        client
          .get("/api/v1/openings/template_repertoires")
          .then(({ data }: { data: RepertoireTemplate[] }) => {
            set(([s]) => {
              s.repertoireTemplates = data;
            });
          });
      }),
    fetchPlayerTemplates: () =>
      set(([s]) => {
        client
          .get("/api/v1/openings/player_templates")
          .then(({ data }: { data: PlayerTemplate[] }) => {
            set(([s]) => {
              s.playerTemplates = data;
            });
          });
      }),
    fetchSupplementary: () =>
      set(([s]) => {
        return client.get("/api/v1/openings/supplementary").then(
          ({
            data,
          }: {
            data: {
              ecoCodes: EcoCode[];
              pawnStructures: PawnStructureDetails[];
            };
          }) => {
            set(([s]) => {
              s.ecoCodes = data.ecoCodes;
              s.ecoCodeLookup = keyBy(s.ecoCodes, (e) => e.epd);
              s.pawnStructures = data.pawnStructures;
              s.pawnStructureLookup = {};
              s.browsingState.onPositionUpdate();
              forEach(s.pawnStructures, (e) => {
                forEach(e.pawnEpds, (pawnEpd) => {
                  s.pawnStructureLookup[pawnEpd] = e;
                });
              });
            });
          }
        );
      }),
    fetchEcoCodes: () =>
      set(([s]) => {
        client
          .get("/api/v1/openings/eco_codes")
          .then(({ data }: { data: EcoCode[] }) => {
            set(([s]) => {
              s.ecoCodes = data;
              s.ecoCodeLookup = keyBy(s.ecoCodes, (e) => e.epd);
            });
          });
      }),
    fetchDebugGames: () =>
      set(([s]) => {
        s.debugPawnStructuresState = {
          games: [],
          loadingGames: true,
          byPosition: {},
          mode: "games",
          i: 0,
        };
        client
          .post("/api/v1/debug/master_games", {
            move_number: NUM_MOVES_DEBUG_PAWN_STRUCTURES,
          })
          .then(({ data }: { data: any }) => {
            set(([s]) => {
              s.debugPawnStructuresState.i = 0;
              s.debugPawnStructuresState.loadingGames = false;
              s.debugPawnStructuresState.games = sortBy(data.games, (g) => {
                return !some(g.pawnStructures, (s) => s.passed);
              });
              if (s.debugPawnStructuresState.mode === "games") {
                s.selectDebugGame(0);
              }
            });
          });
      }),
    selectDebugGame: (i: number) =>
      set(([s]) => {
        let { game, pawnStructures } = s.debugPawnStructuresState.games[i];
        s.debugPawnStructuresState.i = i;
        s.debugPawnStructuresState.game = game;
        s.debugPawnStructuresState.moves = NUM_MOVES_DEBUG_PAWN_STRUCTURES;
        s.debugPawnStructuresState.pawnStructures = sortBy(
          pawnStructures,
          (p) => {
            return !p.passed;
          }
        );
        // s.debugPawnStructuresState.r
        // s.chessboardState.playPgn(
        //   lineToPgn(take(game.moves, NUM_MOVES_DEBUG_PAWN_STRUCTURES))
        // );
      }),
    fetchSharedRepertoire: (id: string) =>
      set(([s]) => {
        Promise.all([
          s.fetchSupplementary(),

          client
            .get(`/api/v1/openings/shared/${id}`)
            .then(({ data }: { data: GetSharedRepertoireResponse }) => {
              set(([s]) => {
                s.repertoire = data.repertoire;
                s.onRepertoireUpdate();
              });
            })
            .catch(() => {
              set(([s]) => {
                s.failedToFetchSharedRepertoire = true;
              });
            }),
        ]).then(() => {
          set(([s, appState]) => {
            // window.location.search = "";
            s.startBrowsing("white", "build");
          });
        });
      }),
    startLichessOauthFlow: () =>
      set(([s]) => {
        let pkce = pkceChallenge();
        let redirectUri = window.location.origin + "/oauth/lichess/callback";
        let lichessOauthData = {
          codeVerifier: pkce.code_verifier,
          redirectUri: redirectUri,
          clientId: "chess-madra",
          codeChallenge: pkce.code_challenge,
        } as LichessOauthData;
        let url = `https://lichess.org/oauth/authorize?response_type=code&client_id=chess-madra&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=email:read&state=&code_challenge=${
          pkce.code_challenge
        }&code_challenge_method=S256`;
        window.sessionStorage.setItem(
          "lichess-oauth-data",
          JSON.stringify(lichessOauthData)
        );
        window.location.href = url;
      }),
    fetchRepertoire: (initial?: boolean) =>
      set(([s]) => {
        client
          .get("/api/v1/openings")
          .then(({ data }: { data: FetchRepertoireResponse }) => {
            set(([s]) => {
              s.repertoire = data.repertoire;
              s.repertoireGrades = data.grades;
              s.repertoireShareId = data.shareId;
              s.hasCompletedRepertoireInitialization = true;
              if (getAllRepertoireMoves(s.repertoire).length > 0) {
              } else {
                // if (!s.hasCompletedRepertoireInitialization) {
                //   s.showImportView = false;
                // }
              }
              s.onRepertoireUpdate();
              if (initial && s.getIsRepertoireEmpty()) {
                s.startBrowsing("white", "build");
                s.browsingState.sidebarState.sidebarOnboardingState.stageStack =
                  [SidebarOnboardingStage.Initial];
              }
              if (TEST_MODE) {
                s.startBrowsing("white", TEST_MODE);
              } else if (!isEmpty(TEST_LINE)) {
                s.startBrowsing("white", "browse", {
                  pgnToPlay: lineToPgn(TEST_LINE),
                });
              }
            });
          });
      }),
    getLineCount: (side?: Side) =>
      get(([s]) => {
        if (!s.repertoire) {
          return 0;
        }
        let seenEpds = new Set();
        let lineCount = 0;
        let recurse = (epd) => {
          if (seenEpds.has(epd)) {
            return;
          }
          seenEpds.add(epd);
          let moves = s.repertoire[side].positionResponses[epd] ?? [];
          if (isEmpty(moves)) {
            return;
          }
          if (lineCount === 0) {
            lineCount = 1;
          }
          let additionalLines =
            filter(moves, (m) => !seenEpds.has(m.epdAfter)).length - 1;
          lineCount += Math.max(0, additionalLines);
          forEach(moves, (variationMove) => {
            recurse(variationMove.epdAfter);
          });
        };
        recurse(START_EPD);
        return lineCount;
      }),
    getNumResponsesBelowThreshold: (threshold: number, side: Side) =>
      get(([s]) => {
        return filter(getAllRepertoireMoves(s.repertoire), (m) => {
          return m.needed;
        }).length;
      }),
    getMyResponsesLength: (side?: Side) =>
      get(([s]) => {
        if (!s.repertoire) {
          return 0;
        }
        if (side) {
          return values(s.repertoire[side].positionResponses)
            .flatMap((v) => v)
            .filter((v) => v.mine).length;
        } else {
          return getAllRepertoireMoves(s.repertoire).length;
        }
      }),
    getIsRepertoireEmpty: (side?: Side) =>
      get(([s]) => {
        if (side) {
          return isEmpty(s.repertoire[side].positionResponses);
        }
        return isEmpty(getAllRepertoireMoves(s.repertoire));
      }),
    backOne: () =>
      set(([s]) => {
        if (s.browsingState.sidebarState.mode === "build") {
          s.browsingState.sidebarState.addedLineState.visible = false;
          s.browsingState.chessboardState.backOne();
          return;
        }
      }),
    backToStartPosition: () =>
      set(([s]) => {
        if (s.browsingState.sidebarState.mode !== "review") {
          s.browsingState.chessboardState.resetPosition();
          return;
        }
      }),
    selectedTemplates: {},
  } as RepertoireState;

  return initialState;
};

function removeLastMove(id: string) {
  return dropRight(id.split(" "), 1).join(" ");
}

function getLastMoveWithNumber(id: string) {
  let [n, m] = last(id.split(" ")).split(".");
  if (!m) {
    return n;
  }
  return `${n}. ${m}`;
}

function mapSides<T, Y>(
  bySide: BySide<T>,
  fn: (x: T, side: Side) => Y
): BySide<Y> {
  return {
    white: fn(bySide["white"], "white"),
    black: fn(bySide["black"], "black"),
  };
}
function getMoveNumber(id: string) {
  return Math.floor(id.split(" ").length / 2 + 1);
}
export const getExpectedNumMovesBetween = (
  current: number,
  destination: number
): number => {
  const get_distance = (x, y) => {
    let distance = 1 / y / (1 / x);
    return Math.pow(distance, 1.2);
  };
  let distance = Math.max(0, get_distance(current, destination));
  current = Math.max(current, 0.45);
  return 1.17262165 * distance;
};
