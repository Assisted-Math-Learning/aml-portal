import { LogicEngineActionType } from './actions.constants';

export const fetchLogicEngineEvaluation = (payload: {
  learnerId: string;
  goToInstructions?: boolean;
}) => ({
  type: LogicEngineActionType.FETCH_LOGIC_ENGINE_EVALUATION,
  payload,
});

export const fetchLogicEngineEvaluationCompleted = () => ({
  type: LogicEngineActionType.FETCH_LOGIC_ENGINE_EVALUATION_COMPLETED,
});

export const fetchLogicEngineEvaluationError = (error: string) => ({
  type: LogicEngineActionType.FETCH_LOGIC_ENGINE_EVALUATION_ERROR,
  payload: error,
});
