import { createSelector } from 'reselect';
import { MediaState } from 'store/reducers/media.reducer';
import { AppState } from '../reducers';

const mediaState = (state: AppState) => state.mediaReducer;

export const isMediaLoadingSelector = createSelector(
  [mediaState],
  (state: MediaState) => Boolean(state.loading)
);

export const mediaSelector = createSelector(
  [mediaState],
  (state: MediaState) => state.media
);

export const mediaErrorSelector = createSelector(
  [mediaState],
  (state: MediaState) => state.error
);

export const currentImageURLSelector = createSelector(
  [mediaState],
  (state: MediaState) => state.currentImageUrl
);

export const isCurrentImageLoadingSelector = createSelector(
  [mediaState],
  (state: MediaState) => Boolean(state.loadingImage)
);

export const imageErrorSelector = createSelector(
  [mediaState],
  (state: MediaState) => state.imageError
);
