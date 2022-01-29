import { createGlobalState } from 'react-hooks-global-state';

const { setGlobalState, useGlobalState } = createGlobalState({
    isUserCreated: false,
});

export const setIsUserCreated = (v) => {
    setGlobalState('isUserCreated', v);
};

export { useGlobalState };