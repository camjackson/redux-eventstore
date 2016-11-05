import { createStore, applyMiddleware } from 'redux';
import sideEffectMiddleware from '../sideEffectMiddleware';

describe('sideEffectMiddleware', () => {
  it('throws an error when sideEffects is invalid', () => {
    expect(() => sideEffectMiddleware(null)).toThrowError(/Invalid sideEffects/);
    expect(() => sideEffectMiddleware('hello')).toThrowError(/Invalid sideEffects/);
    expect(() => sideEffectMiddleware(() => {})).toThrowError(/Invalid sideEffects/);
  });

  it('throws an error when one of the side effect functions is invalid', () => {
    expect(() => sideEffectMiddleware({ FOO: null })).toThrowError(/Invalid side effect FOO/);
    expect(() => sideEffectMiddleware({ FOO: 'bar' })).toThrowError(/Invalid side effect FOO/);
    expect(() => sideEffectMiddleware({ FOO: {} })).toThrowError(/Invalid side effect FOO/);
  });

  it('calls the side effect when the matching action is dispatched', () => {
    const foo = jest.fn();
    const bar = jest.fn();

    const sideEffects = {
      FOO: foo,
      BAR: bar,
    };

    const store = createStore(() => {}, applyMiddleware(sideEffectMiddleware(sideEffects)));

    store.dispatch({ type: 'FOO', payload: 'batman' });
    expect(foo).toBeCalledWith({ type: 'FOO', payload: 'batman' }, store.getState);
    store.dispatch({ type: 'BAR', payload: 'robin' });
    expect(bar).toBeCalledWith({ type: 'BAR', payload: 'robin' }, store.getState);
  });
});
