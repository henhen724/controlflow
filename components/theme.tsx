import React from 'react';
import { ThemeProvider as MuiThemeProvider, createMuiTheme, darken, } from '@material-ui/core/styles';
import { red, blue } from '@material-ui/core/colors';
import { getCookie, setCookie } from '../lib/style-cookies';

const themeInitialOptions = {
    dense: false,
    direction: 'ltr' as "ltr",
    paletteColors: {},
    spacing: 8, // spacing unit
};

const useEnhancedEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

interface ThemeState {
    dense: boolean,
    direction?: "ltr",
    paletteColors: Object,
    paletteType?: "light" | "dark",
    spacing: number
}

type ThemeContext = ({ type, payload }: { type: string, payload: any }) => void;

type ContextProps = ThemeContext | (() => never);

export const DispatchContext = React.createContext<ContextProps>(() => {
    throw new Error('Forgot to wrap component in `ThemeProvider`');
});

if (process.env.NODE_ENV !== 'production') {
    DispatchContext.displayName = 'ThemeDispatchContext';
}


export default function theme(props: any) {
    const { children } = props;

    const [themeOptions, dispatch] = React.useReducer((state: ThemeState, action: any,) => {
        switch (action.type) {
            case 'RESET_COLORS':
                return {
                    ...state,
                    paletteColors: themeInitialOptions.paletteColors,
                };
            case 'CHANGE':
                return {
                    ...state,
                    paletteType: action.payload.paletteType || state.paletteType,
                    direction: action.payload.direction || state.direction,
                    paletteColors: action.payload.paletteColors || state.paletteColors,
                };
            default:
                throw new Error(`Unrecognized type ${action.type}`);
        }
    }, themeInitialOptions);
    const { dense, direction, paletteColors, paletteType = 'dark', spacing } = themeOptions;

    React.useEffect(() => {
        if (process.browser) {
            const nextPaletteColors = JSON.parse(getCookie('paletteColors') || 'null');
            const nextPaletteType = getCookie('paletteType');

            dispatch({
                type: 'CHANGE',
                payload: { paletteColors: nextPaletteColors, paletteType: nextPaletteType },
            });
        }
    }, []);

    // persist paletteType
    React.useEffect(() => setCookie('paletteType', paletteType, { path: '/', maxAge: 31536000 }), [paletteType]);

    useEnhancedEffect(() => {
        document.body.dir = direction;
    }, [direction]);

    const theme = React.useMemo(() => {
        const nextTheme = createMuiTheme(
            {
                direction,
                palette: {
                    primary: {
                        main: paletteType === 'light' ? '#ff8080' : red[200],
                        light: '#ff8080',
                        dark: red[200],
                    },
                    secondary: {
                        main: paletteType === 'light' ? darken(blue.A400, 0.1) : blue[200],
                        light: darken(blue.A400, 0.1),
                        dark: blue[200],
                    },
                    type: paletteType,
                    background: {
                        default: paletteType === 'light' ? '#fcfcfc' : '#333333',
                        paper: paletteType === 'light' ? '#d0d0d0' : '#535353',
                    },
                    ...paletteColors,
                },
                spacing,
            },
        );
        return nextTheme;
    }, [dense, direction, paletteColors, paletteType, spacing]);
    return (
        <MuiThemeProvider theme={theme}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </MuiThemeProvider>);
}

export const useChangeTheme = () => {
    const dispatch = React.useContext(DispatchContext);
    return React.useCallback((options) => dispatch({ type: 'CHANGE', payload: options }), [dispatch]);
}