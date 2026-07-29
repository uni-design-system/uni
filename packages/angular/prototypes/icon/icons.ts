import { AngularThemeManifest } from './icon-manifest';

export const material3ThinThemeManifest: AngularThemeManifest = {
  themeId: 'material3-weight-100',
  slots: {
    // === NAVIGATION & LAYOUT ===
    'navigation.menu': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M140-250v-60h680v60H140Zm0-200v-60h680v60H140Zm0-200v-60h680v60H140Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'navigation.chevron-up': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="m291-342-43-43 232-232 232 232-43 43-189-189-189 189Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'navigation.chevron-down': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M480-345 248-577l43-43 189 189 189-189 43 43-232 232Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'navigation.chevron-left': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M561-248 329-480l232-232 43 43-189 189 189 189-43 43Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'navigation.chevron-right': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M379-248l-43-43 189-189-189-189 43-43 232 232-232 232Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'navigation.arrow-left': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M655-175 350-480l305-305 43 43-262 262 262 262-43 43Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'navigation.arrow-right': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M305-175l-43-43 262-262-262-262 43-43 305 305-305 305Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'navigation.home': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M180-180v-460l300-225 300 225v460H540v-240H420v240H180Z" fill="none" stroke="currentColor" stroke-width="1.2"/>`,
    },
    'navigation.external-link': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v60H200v560h560v-280h60v280q0 33-23.5 56.5T760-120H200Zm318-438L476-600l242-242H560v-60h260v260h-60v-158L518-558Z" stroke="currentColor" stroke-width="1"/>`,
    },

    // === ACTIONS & CONTROLS ===
    'action.search': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M796-124 534-386q-30 26-68 40t-82 14q-106 0-181-75t-75-181q0-106 75-181t181-75q106 0 181 75t75 181q0 44-14 82t-40 68l262 262-42 42ZM384-392q80 0 136-56t56-136q0-80-56-136t-136-56q-80 0-136 56t-56 136q0 80 56 136t136 56Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'action.close': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'action.plus': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M450-450H180v-60h270v-270h60v270h270v60H510v270h-60v-270Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'action.delete': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M261-120q-24.75 0-42.375-17.625T201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-17.625 41.625T699-120H261Zm438-630H261v570h438v-570ZM367-270h60v-390h-60v390Zm166 0h60v-390h-60v390Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'action.edit': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M160-160v-130l444-444 130 130-444 444H160Zm514-514 44-44q12-12 28-12t28 12l74 74q12 12 12 28.5T848-629l-44 44-130-130Z" fill="none" stroke="currentColor" stroke-width="1.2"/>`,
    },
    'action.download': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M480-313 287-506l43-43 120 120v-371h60v371l120-120 43 43-193 193ZM220-180q-24 0-41.5-17.5T161-239v-131h60v131h alternate518h598v-131h60v131q0 24-17.5 41.5T740-180H220Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'action.upload': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M450-526v346h60v-346l120 120 43-43-193-193-193 193 43 43 120-120ZM220-180q-24 0-41.5-17.5T161-239v-131h60v131h560v-131h60v131q0 24-17.5 41.5T740-180H220Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'action.share': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M710-180q-38 0-64-26t-26-64q0-5 1-11l-298-173q-11 11-25.5 17t-30.5 6q-38 0-64-26t-26-64q0-38 26-64t64-26q16 0 30.5 6t25.5 17l299-174q-1-5-1-10 0-38 26-64t64-26q38 0 64 26t26 64q0 38-26 64t-64 26q-16 0-30.5-6t-25.5-17L385-508q1 5 1 10 0 5-1 10l327 190q11-11 25.5-17t30.5-6q38 0 64 26t26 64q0 38-26 64t-64 26Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'action.filter': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M440-120v-240h80v80h280v80H520v80h-80Zm-280-80v-80h200v80H160Zm160-200v-80H160v-80h160v-80h80v240h-80Zm160-80v-80h400v80H480ZM640-600v-240h80v80h160v80H720v80h-80Zm-480-80v-80h400v80H160Z" stroke="currentColor" stroke-width="1"/>`,
    },

    // === STATUS & FEEDBACK ===
    'feedback.success': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="m382-354 339-339-42-42-297 297-144-144-42 42 186 186Zm98 274q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-60q142 0 241-99t99-241q0-142-99-241t-241-99q-142 0-241 99t-99 241q0 142 99 241t241 99Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'feedback.info': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M450-420v-210h60v210h-60Zm30 300q-83 0-156-31.5T197-237q-54-54-85.5-127T80-520q0-83 31.5-156T197-803q54-54 127-85.5T480-920q83 0 156 31.5T763-803q54 54 85.5 127T880-520q0 83-31.5 156T763-237q-54 54-127 85.5T480-120Zm0-60q142 0 241-99t99-241q0-142-99-241t-241-99q-142 0-241 99t-99 241q0 142 99 241t241 99Zm-30-510v-60h60v60h-60Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'feedback.warning': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M480-280q13 0 21.5-8.5T510-310q0-13-8.5-21.5T480-340q-13 0-21.5 8.5T450-310q0 13 8.5 21.5T480-280Zm-30-140h60v-200h-60v200Zm30 334L74-173q-19 11-28.5 29.5T45-103q0 23 10.5 43t30.5 30h788q20-10 30.5-30t10.5-43q0-22-9.5-40.5T886-173L480-736q-10-18-28.5-28t-40.5-10q-22 0-40.5 10T342-746L480-86Zm0-69L114-150h732L480-775Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'feedback.error': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M480-310q13 0 21.5-8.5T510-340q0-13-8.5-21.5T480-370q-13 0-21.5 8.5T450-340q0 13 8.5 21.5T480-310Zm-30-140h60v-200h-60v200Zm30 370q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-60q142 0 241-99t99-241q0-142-99-241t-241-99q-142 0-241 99t-99 241q0 142 99 241t241 99Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'feedback.lock': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q0 33 23.5 56.5T760-560v400q0 33-23.5 56.5T710-80H240Zm0-60h470v-400H240v400Zm240-140q25 0 42.5-17.5T540-340q0-25-17.5-42.5T480-400q-25 0-42.5 17.5T420-340q0 25 17.5 42.5T480-280Zm-140-360h280v-80q0-58-41-99t-99-41q-58 0-99 41t-41 99v80Z" stroke="currentColor" stroke-width="1"/>`,
    },

    // === USER & SYSTEM ===
    'user.profile': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-60q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm0 420q-126 0-224.5-57.5T100-252q4-49 41.5-78.5T237-360q60 10 119.5 15t123.5 5q64 0 123.5-5t119.5-15q58 0 95.5 29.5T856-252q-16 98-114.5 155T480-120Zm0-60q97 0 171.5-41.5T745-316q-52 14-106.5 21t-158.5 7q-104 0-158.5-7T215-316q19 54 93.5 95.5T480-180Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'user.settings': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="m370-80-16-128q-18-5-38.5-15.5T279-247l-120 50-50-84 104-78q-2-12-2.5-24.5t.5-24.5q1-12 2-24.5t3-24.5L109-455l50-84 120 50q16-14 36-24.5t39-15.5l16-128h100l16 128q21 6 39.5 16t35.5 24l120-50 50 84-104 78q3 12 3 24.5t-.5 24.5q-.5 12-2 24.5t-4 24.5l104 78-50 84-120-50q-15 14-35 24.5t-39.5 15.5L590-80H370Zm60-60h100l14-114q28-6 53.5-18.5T644-304l106 44 50-86-92-70q4-14 5.5-28.5t1.5-29.5q0-15-2-29.5t-5-28.5l92-70-50-86-106 44q-21-20-46.5-32.5T544-706l-14-114H430l-14 114q-29 6-54.5 18.5T316-656l-106-44-50 86 92 70q-4 14-5.5 28.5t-1.5 29.5q0 15 2 29.5t5 28.5l-92 70 50 86 106-44q21 20 46.5 32.5T416-254l14 114Zm50-220q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'user.notification': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M480-120q-33 0-56.5-23.5T400-200h160q0 33-23.5 56.5T480-120Zm-280-140v-60h60v-235q0-90 56-159t144-83v-23q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v23q88 14 144 83t56 159v235h60v60H200Zm280-120Z" fill="none" stroke="currentColor" stroke-width="1.2"/>`,
    },
    'user.heart': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M480-184L174-490q-43-43-63.5-98.5T90-701q0-109 75.5-184T349-960q62 0 115.5 25.5T555-865q37-44 90.5-69.5T761-960q109 0 184.5 75T1021-701q0 57-20.5 112.5T937-490L630-184q-15 15-35.5 22.5T550-154q-21 0-41.5-7.5T473-184Zm354-348q33-33 49.5-76t16.5-89q0-84-58-142t-142-58q-49 0-90.5 23.5T542-671l-62 74-62-74q-26-31-67.5-54.5T261-749q-84 0-142 58t-58 142q0 46 16.5 89t49.5 76l305 305 302-302Z" stroke="currentColor" stroke-width="1"/>`,
    },
    'user.help': {
      viewBox: '0 -960 960 960',
      innerHtml: `<path d="M480-260q13 0 21.5-8.5T510-290q0-13-8.5-21.5T480-320q-13 0-21.5 8.5T450-290q0 13 8.5 21.5T480-260Zm-40-150h80q0-46 19.5-74.5T582-550q35-33 46.5-66.5T640-689q0-70-47-110.5T474-840q-74 0-123 39.5T284-696l72 30q15-41 45-62.5t73-21.5q46 0 71 20.5t25 54.5q0 21-12 40.5T502-536q-45 42-53.5 71.5T440-410Z" stroke="currentColor" stroke-width="1"/>`,
    },
  },
};
