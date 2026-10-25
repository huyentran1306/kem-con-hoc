/* ============================================================
   KÈM CON HỌC — THEME SLOTS REGISTRY
   Prompt 07 Phần B (Kiến trúc khe giao diện cho 3 màn chính)
   ============================================================ */
import {
  DefaultHomeHero,
  DefaultStudyTracker,
  DefaultStartAction,
  DefaultHomeExtras,
  DefaultStepProgress,
  DefaultReadCard,
  DefaultHintList,
  DefaultAnswerReveal,
  DefaultScaffoldActions,
  DefaultDoneCelebration,
  DefaultTeachBackPicker,
  DefaultDoneNext,
  DefaultCheckWorkEntry,
} from './defaultSlots'

import {
  BearStudyTracker,
  BearStartAction,
  CandyStudyTracker,
  CandyStartAction,
  GardenStudyTracker,
  GardenStartAction,
  ChalkStudyTracker,
  ChalkStartAction,
  BentoStudyTracker,
  BentoStartAction,
  AuroraStudyTracker,
  AuroraStartAction,
  StickerStudyTracker,
  StickerStartAction,
  NotebookStudyTracker,
  NotebookStartAction,
} from './themedSlots'

const THEME_SLOT_OVERRIDES = {
  bear: {
    StudyTracker: BearStudyTracker,
    StartAction: BearStartAction,
  },
  candy: {
    StudyTracker: CandyStudyTracker,
    StartAction: CandyStartAction,
  },
  garden: {
    StudyTracker: GardenStudyTracker,
    StartAction: GardenStartAction,
  },
  chalk: {
    StudyTracker: ChalkStudyTracker,
    StartAction: ChalkStartAction,
  },
  bento: {
    StudyTracker: BentoStudyTracker,
    StartAction: BentoStartAction,
  },
  aurora: {
    StudyTracker: AuroraStudyTracker,
    StartAction: AuroraStartAction,
  },
  sticker: {
    StudyTracker: StickerStudyTracker,
    StartAction: StickerStartAction,
  },
  notebook: {
    StudyTracker: NotebookStudyTracker,
    StartAction: NotebookStartAction,
  },
}

const DEFAULT_SLOTS = {
  HomeHero: DefaultHomeHero,
  StudyTracker: DefaultStudyTracker,
  StartAction: DefaultStartAction,
  HomeExtras: DefaultHomeExtras,
  StepProgress: DefaultStepProgress,
  ReadCard: DefaultReadCard,
  HintList: DefaultHintList,
  AnswerReveal: DefaultAnswerReveal,
  ScaffoldActions: DefaultScaffoldActions,
  DoneCelebration: DefaultDoneCelebration,
  TeachBackPicker: DefaultTeachBackPicker,
  DoneNext: DefaultDoneNext,
  CheckWorkEntry: DefaultCheckWorkEntry,
}

export function getSlot(themeId, slotName) {
  const overrides = THEME_SLOT_OVERRIDES[themeId]
  if (overrides && overrides[slotName]) {
    return overrides[slotName]
  }
  return DEFAULT_SLOTS[slotName] || null
}

export { DEFAULT_SLOTS }
