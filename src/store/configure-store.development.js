import { createStore, applyMiddleware, compose } from 'redux';
import { END } from 'redux-saga';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers/hearts';
import sagaMiddleware from './saga-middleware';

/** Use redux-devtools-extension for Chrome or Firefox browsers in development mode
 *  Repo: https://github.com/zalmoxisus/redux-devtools-extension
 *  Chrome Extension: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
 *  Firefox Add-on: https://addons.mozilla.org/en-US/firefox/addon/remotedev
 */
const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
const enhancer = composeEnhancers(
  // Middleware you want to use in development
  applyMiddleware(sagaMiddleware, createLogger({ collapsed: true })),
  // Optional. Lets you write ?debug_session=<key> in address bar to persist debug sessions
);

const configureStore = (preloadedState) => {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  const store = createStore(rootReducer, preloadedState, enhancer);

  store.runSaga = sagaMiddleware.run;
  store.close = () => store.dispatch(END);
  return store;
};

export default configureStore;
