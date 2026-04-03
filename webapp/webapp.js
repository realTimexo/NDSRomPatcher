/* Ultimate Rom Patcher - webapp implementation */


/* disable forced HTTPS redirect (works in both HTTP dev and HTTPS prod) */
const FORCE_HTTPS = false;
if (FORCE_HTTPS && location.protocol === 'http:')
        location.href = window.location.href.replace('http:', 'https:');
else if (location.protocol === 'https:' && 'serviceWorker' in navigator && window.location.hostname === 'www.marcrobledo.com')
        navigator.serviceWorker.register('/RomPatcher.js/_cache_service_worker.js', { scope: '/RomPatcher.js/' });


/* ── LANGUAGE DETECTION ──────────────────────────────────────── */
const SUPPORTED_LANGUAGES = ['en','fr','de','it','es','nl','sv','ca','ca-va','pt-br','ru','ja','zh-cn','zh-tw'];
function detectSystemLanguage() {
        const raw = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        /* exact match first */
        if (SUPPORTED_LANGUAGES.indexOf(raw) !== -1) return raw;
        /* prefix match (e.g. "zh-CN" → "zh-cn", "pt-BR" → "pt-br") */
        const normalized = raw.replace('_', '-');
        if (SUPPORTED_LANGUAGES.indexOf(normalized) !== -1) return normalized;
        /* two-letter prefix (e.g. "en-US" → "en") */
        const prefix = raw.substring(0, 2);
        if (SUPPORTED_LANGUAGES.indexOf(prefix) !== -1) return prefix;
        return 'en';
}


/* ── SETTINGS ────────────────────────────────────────────────── */
const LOCAL_STORAGE_SETTINGS_ID = 'rom-patcher-js-settings';
const settings = {
        language: detectSystemLanguage(),
        outputSuffix: true,
        fixChecksum: true,
        theme: 'default'
};

/* load saved settings from localStorage */
if (typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_SETTINGS_ID)) {
        try {
                const loadedSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SETTINGS_ID));

                if (typeof loadedSettings.language === 'string')
                        settings.language = loadedSettings.language;

                if (typeof loadedSettings.outputSuffix === 'boolean')
                        settings.outputSuffix = loadedSettings.outputSuffix;

                if (typeof loadedSettings.fixChecksum === 'boolean')
                        settings.fixChecksum = loadedSettings.fixChecksum;

                if (typeof loadedSettings.theme === 'string' && ['light'].indexOf(loadedSettings.theme) !== -1)
                        settings.theme = loadedSettings.theme;
        } catch (err) {
                console.error('Error loading settings: ' + err.message);
        }
}

const buildSettingsForWebapp = function () {
        return {
                language: settings.language,
                outputSuffix: settings.outputSuffix,
                fixChecksum: settings.fixChecksum,
                allowDropFiles: true,
                ondropfiles: function () {}
        };
};

const saveSettings = function () {
        if (typeof localStorage !== 'undefined')
                localStorage.setItem(LOCAL_STORAGE_SETTINGS_ID, JSON.stringify(settings));
        RomPatcherWeb.setSettings(buildSettingsForWebapp());
};


/* ── INIT ────────────────────────────────────────────────────── */
window.addEventListener('load', function () {
        /* apply theme */
        document.body.className = 'theme-' + settings.theme;

        /* settings button */
        document.getElementById('button-settings').addEventListener('click', function () {
                document.getElementById('dialog-settings').showModal();
        });
        document.getElementById('dialog-settings-button-close').addEventListener('click', function () {
                document.getElementById('dialog-settings').close();
        });

        /* language */
        const langSelect = document.getElementById('settings-language');
        /* set to saved/detected language, fallback to 'en' if option not found */
        if (langSelect.querySelector('option[value="' + settings.language + '"]')) {
                langSelect.value = settings.language;
        } else {
                langSelect.value = 'en';
                settings.language = 'en';
        }
        langSelect.addEventListener('change', function () {
                settings.language = this.value;
                saveSettings();
                RomPatcherWeb.translateUI(settings.language);
        });

        /* use patch name for output — checkbox is inverted (checked = use ROM name) */
        document.getElementById('settings-output-suffix').checked = !settings.outputSuffix;
        document.getElementById('settings-output-suffix').addEventListener('change', function () {
                settings.outputSuffix = !this.checked;
                saveSettings();
        });

        /* fix checksum */
        document.getElementById('settings-fix-checksum').checked = settings.fixChecksum;
        document.getElementById('settings-fix-checksum').addEventListener('change', function () {
                settings.fixChecksum = this.checked;
                saveSettings();
        });

        /* light theme */
        document.getElementById('settings-light-theme').checked = settings.theme === 'light';
        document.getElementById('settings-light-theme').addEventListener('change', function () {
                settings.theme = this.checked ? 'light' : 'default';
                saveSettings();
                document.body.className = 'theme-' + settings.theme;
        });

        /* initialize patcher */
        try {
                RomPatcherWeb.initialize(buildSettingsForWebapp());
        } catch (err) {
                var message = err.message;
                if (/incompatible browser/i.test(message) || /variable RomPatcherWeb/i.test(message))
                        message = 'Your browser is outdated and not compatible with Ultimate Rom Patcher.<br/><a href="legacy/">Try the legacy version</a>';
                document.getElementById('rom-patcher-container').innerHTML = message;
                document.getElementById('rom-patcher-container').style.color = 'red';
        }
});
			try{
				if(!PatchBuilderWeb.isInitialized())
					PatchBuilderWeb.initialize();
			}catch(err){
				document.getElementById('patch-builder-container').innerHTML = err.message;
				document.getElementById('patch-builder-container').style.color = 'red';
			}

			currentMode = 'creator';
			document.getElementById('rom-patcher-container').style.display = 'none';
			document.getElementById('patch-builder-container').style.display = 'block';
			document.getElementById('switch-create').className = 'switch enabled';
		} else {
			currentMode = 'patcher';
			document.getElementById('rom-patcher-container').style.display = 'block';
			document.getElementById('patch-builder-container').style.display = 'none';
			document.getElementById('switch-create').className = 'switch disabled';
		}
	});

	try {
		const initialSettings = buildSettingsForWebapp();
		RomPatcherWeb.initialize(initialSettings);
	} catch (err) {
		var message = err.message;
		if (/incompatible browser/i.test(message) || /variable RomPatcherWeb/i.test(message))
			message = 'Your browser is outdated and it is not compatible with the latest version of Rom Patcher JS.<br/><a href="legacy/">Try the legacy version</a>';

		document.getElementById('rom-patcher-container').innerHTML = message;
		document.getElementById('rom-patcher-container').style.color = 'red';
	}
});

