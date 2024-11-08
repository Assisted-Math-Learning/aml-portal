import Instructions from 'views/contents/dashboard/Instructions';
import ContinueJourney from 'views/contents/dashboard/ContinueJourney';
import Welcome from 'views/contents/dashboard/Welcome';
import Questions from 'views/contents/dashboard/Questions';
import Completed from 'views/contents/dashboard/Completed';
import { AppRoutesConfigType } from './routes.types';
import { webRoutes } from '../utils/constants/webRoutes.constants';
import { RouteKey } from '../types/enum';

export const appRoutes: Array<AppRoutesConfigType> = [
  {
    name: 'Instructions',
    path: webRoutes.instructions.root(),
    key: RouteKey.INSTRUCTIONS,
    component: Instructions,
  },
  {
    name: 'Continue Journey',
    path: webRoutes.continueJourney.root(),
    key: RouteKey.CONTINUE_JOURNEY,
    component: ContinueJourney,
  },
  {
    name: 'Welcome',
    path: webRoutes.welcome.root(),
    key: RouteKey.WELCOME,
    component: Welcome,
  },
  {
    name: 'Questions',
    path: webRoutes.questions.root(),
    key: RouteKey.QUESTIONS,
    component: Questions,
  },
  {
    name: 'Completed',
    path: webRoutes.completed.root(),
    key: RouteKey.COMPLETED,
    component: Completed,
  },
];
