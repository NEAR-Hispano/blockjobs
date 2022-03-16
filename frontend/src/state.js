import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState({
  isUserCreated: false,
  userProfile: null
});

export const setIsUserCreated = (v) => {
  setGlobalState("isUserCreated", v);
};

export const setUserProfile = (v) => {
  setGlobalState("userProfile", v);
};

export { useGlobalState };
