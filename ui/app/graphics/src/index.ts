// Declare require method which we'll use for importing webpack resources (using ES6 imports will confuse typescript parser)
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {OrApp, AppConfig, appReducer, RealmAppConfig, PageProvider} from '@openremote/or-app';
import {MapType} from '@openremote/model';
import {pageHomeProvider} from "./pages/page-home";

const rootReducer = combineReducers({
    app: appReducer
});

type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
    reducer: rootReducer
});

const ogApp = new OrApp(store);

export const DefaultPagesConfig: PageProvider<any>[] = [
    pageHomeProvider(store)
];


export const DefaultRealmConfig: RealmAppConfig = {
    appTitle: 'Our Grid',
    styles: ':host > * {--or-app-color2: #F0F0F0; --or-app-color3: #22211f; --or-app-color4: #4F2D39; --or-app-color5: #CCCCCC;}',
    logo: '../images/logo.png',
    logoMobile: '../images/logo-mobile.png'
};

// Configure manager connection and i18next settings
ogApp.managerConfig = {
    realm: 'master',
    loadTranslations: ['app', 'or'],
    autoLogin: true,
    mapType: MapType.VECTOR
};

export const DEFAULT_LANGUAGE: string = 'nl';

ogApp.appConfigProvider = (ogManager) => {

    // Configure app pages and per realm styling/settings
    const ogAppConfig: AppConfig<RootState> = {
        pages: [...DefaultPagesConfig],
        languages: {
            nl: 'dutch',
            en: 'english'
        },
        realms: {
            default: {...DefaultRealmConfig}
        }
    }

    // Check local storage for set language, otherwise use language set in config
    ogManager.console.retrieveData("LANGUAGE").then((value: string | undefined) => {
        ogManager.language = (value ? value : DEFAULT_LANGUAGE);
    }).catch(() => {
        ogManager.language = DEFAULT_LANGUAGE;
    });

    return ogAppConfig;
}

document.body.appendChild(ogApp);
