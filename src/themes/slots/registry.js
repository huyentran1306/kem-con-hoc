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
} from './defaultSlots'

import {
  BearStudyTracker,
  BearStartAction,
  CandyStudyTracker,
  GardenStudyTracker,
  GardenStartAction,
  ChalkStudyTracker,
  BentoStudyTracker,
  AuroraStudyTracker,
} from './themedSlots'

const THEME_SLOT_OVERRIDES = {
  bear: {
    StudyTracker: BearStudyTracker,
    StartAction: BearStartAction,
  },
  candy: {
    StudyTracker: CandyStudyTracker,
  },
  garden: {
    StudyTracker: GardenStudyTracker,
    StartAction: GardenStartAction,
  },
  chalk: {
    StudyTracker: ChalkStudyTracker,
  },
  bento: {
    StudyTracker: BentoStudyTracker,
  },
  aurora: {
    StudyTracker: AuroraStudyTracker,
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
}

export function getSlot(themeId, slotName) {
  const overrides = THEME_SLOT_OVERRIDES[themeId]
  if (overrides && overrides[slotName]) {
    return overrides[slotName]
  }
  return DEFAULT_SLOTS[slotName] || null
}

export { DEFAULT_SLOTS }
