import produce from 'immer';
import { Reducer } from 'redux';
import {
  FetchContentMediaActionType,
  FetchQuestionImageActionType,
  LogicEngineActionType,
} from 'store/actions/actions.constants';

export interface MediaState {
  loading?: boolean;
  error?: string;
  media: { [key: string]: any };
  currentImageUrl: string;
  loadingImage: boolean;
}

const initialState: MediaState = {
  loading: false,
  media: {},
  currentImageUrl: '',
  loadingImage: false,
};

export const mediaReducer: Reducer<MediaState> = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: MediaState = initialState,
  action
) =>
  produce(state, (draft: MediaState) => {
    switch (action.type) {
      case FetchContentMediaActionType.FETCH_MEDIA: {
        draft.loading = true;
        break;
      }
      case FetchContentMediaActionType.FETCH_MEDIA_COMPLETED: {
        const media: any = action.payload as { contentId: string; media: any };
        draft.media[media.contentId] = media;
        draft.loading = false;
        break;
      }
      case FetchContentMediaActionType.FETCH_MEDIA_ERROR: {
        const error = action.payload as string;
        draft.loading = false;
        draft.error = error;
        break;
      }
      case FetchQuestionImageActionType.FETCH_QUESTION_IMAGE: {
        draft.loadingImage = true;
        draft.currentImageUrl = '';
        break;
      }
      case FetchQuestionImageActionType.FETCH_QUESTION_IMAGE_COMPLETED: {
        const imageURL: any = action.payload as {
          currentImageURL: string;
        };
        draft.currentImageUrl = imageURL?.currentImageURL;
        draft.loadingImage = false;
        break;
      }
      case FetchQuestionImageActionType.FETCH_QUESTION_IMAGE_ERROR: {
        const error = action.payload as string;
        draft.loadingImage = false;
        draft.error = error;
        break;
      }
      case LogicEngineActionType.FETCH_LOGIC_ENGINE_EVALUATION: {
        draft.media = {};
        break;
      }
      default: {
        break;
      }
    }
  });
