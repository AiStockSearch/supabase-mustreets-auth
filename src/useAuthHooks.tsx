import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type OAuthResponse, type Provider } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import data, { type iAssets } from './data';

const supabaseUrl =
  process.env.supabaseUrl || 'https://thvrwnbsttxeuftxuexd.supabase.co';
const supabaseAnonKey =
  process.env.supabaseUrl ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodnJ3bmJzdHR4ZXVmdHh1ZXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgwMzEwNTUsImV4cCI6MjAyMzYwNzA1NX0.AisHKeFyTIUCrrfkZ1xgqmeKjKiTWVhfdnm9iUI0ScE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const initialState = {
  logger: [],
  index: 0,
  register: data[0]
}
type iInitialState = {
  logger: Array<{ type: iTypeReducer, payload: iPayload, state: iInitialState }>,
  register: iAssets | undefined,
  index: number,
  responce?: OAuthResponse,
}

const combaineInitialState = Object.assign(initialState, { logger: [initialState] })


const RECOVER = 'RECOVER'
const EMAIL = 'EMAIL'
const CHANGE_INDEX = 'CHANGE_INDEX'
const OAUTH = 'OAUTH'

type iActionSystem = 'RECOVER'
type iNewAction = 'EMAIL' | 'CHANGE_INDEX' | 'OAUTH'
type iTypeReducer = iAssets | iActionSystem | iNewAction
type iReducerHandleState = [iInitialState, React.Dispatch<any>]
type iPayload = iInitialState['index'] | OAuthResponse['data'] | any
type iActionDispatch = { type: iTypeReducer, payload: iPayload }
type iHandleBeforeEffect = () => void
type iHandleAfterEffect = () => void
type iDisatch = (e: iActionDispatch) => void


class MyReducer {
  private state: iInitialState;
  constructor(initialState: iInitialState) {
    this.state = initialState;

  }

  reduce(state: iInitialState, action: { type: iTypeReducer; payload: iPayload }) {
    this.state = state
    switch (action.type) {
      case RECOVER:
        return state.logger[0]?.state ?? combaineInitialState
    }
    state['logger'] = [{ ...action, state: this.state }].concat(this.state['logger']).splice(0, 10)
    switch (action.type) {
      case EMAIL:
        return { ...this.state, register: action.type, [action.type]: action.payload }
      case OAUTH:
        return { ...this.state, responce: action.payload, }
      case CHANGE_INDEX: {
        return { ...this.state, index: action.payload, register: data[action.payload] }
      }
    }
  }
}

const handleWorkWithReducer =
  (dispatch: iDisatch) =>
    (type: iTypeReducer) => ({
      payload,
      beforeEffect,
      afterEffect
    }
      : {
        payload: iActionDispatch,
        beforeEffect: iHandleBeforeEffect,
        afterEffect: iHandleAfterEffect
      }
    ) => {
      if (beforeEffect) {
        requestAnimationFrame(() => {
          beforeEffect()
        })
      }
      dispatch({ type, payload })
      if (afterEffect) {
        requestAnimationFrame(() => {
          afterEffect()
        })
      }
    }

export const useAuthHook = () => {
  const reducer = new MyReducer(combaineInitialState);
  const [state, dispatch]: iReducerHandleState | any = React.useReducer<any>(reducer.reduce, combaineInitialState)
  const [openModal, setOpenModal]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [link, setLink]: [string, React.Dispatch<React.SetStateAction<string>>] = React.useState('');
  const initializeHandleReducer = handleWorkWithReducer(dispatch)

  const onConnectPress = () => {
    if (state['index'] && data[state['index']]) {
      initializeHandleReducer(OAUTH)({
        payload: {},
        afterEffect: signInWithGithub,
        beforeEffect: signOut
      })

      return;
    }
  }

  async function signInWithGithub() {
    const responce: OAuthResponse = await supabase.auth.signInWithOAuth({
      provider: data[state['index']]?.toLowerCase() as Provider,
    })
    initializeHandleReducer(OAUTH)({
      payload: responce['data'],
      afterEffect: () => null,
      beforeEffect: () => null
    })
  }
  async function signOut() {
    const { error } = await supabase.auth.signOut();
  }

  const onNavigationStateChange = async (event) => {
    if (event.url) {
      const params = new URLSearchParams(event.url.split('#')[1]);
      const paramValue = params.get('paramName'); // 'paramName' - замените на имя вашего параметра
      if (event.url.includes('http://localhost:3000')) {
        setLink('');
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log({ user });
    }
  };

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return {
    currentIndex: [state['index'], (payload: iInitialState['index']) => {
      initializeHandleReducer(CHANGE_INDEX)({
        payload,
        afterEffect: () => { },
        beforeEffect: () => { }
      })
    }],
    onConnectPress,
    modal: [openModal, setOpenModal],
    github: [signInWithGithub, signOut],
    link: [link, onNavigationStateChange, setLink],
  };
};

AppState.addEventListener('change', (state) => {
  console.log({ state });
  if (state === 'active') {
    console.log('active');
    supabase.auth.startAutoRefresh();
  } else {
    console.log('disactive');
    supabase.auth.stopAutoRefresh();
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
