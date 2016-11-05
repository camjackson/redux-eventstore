import { validate } from './util';

export default sideEffects => {
  validate(sideEffects, 'sideEffects', 'object', true);
  Object.keys(sideEffects).forEach(sideEffect => {
    validate(sideEffects[sideEffect], `side effect ${sideEffect}`, 'function', true);
  });

  return store => next => action => {
    if (sideEffects[action.type]) {
      sideEffects[action.type](action, store.getState);
    }
    return next(action);
  };
};
