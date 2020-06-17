module.exports = {
  capabilities: {},
  client: {
    clientName: 'WEB_REMIX',
    clientVersion: '0.1',
    experimentIds: [],
    experimentsToken: '',
    gl: 'DE',
    hl: 'en',
    locationInfo: {
      locationPermissionAuthorizationStatus: 'LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED'
    },
    musicAppInfo: {
      musicActivityMasterSwitch: 'MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE',
      musicLocationMasterSwitch: 'MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE',
      pwaInstallabilityStatus: 'PWA_INSTALLABILITY_STATUS_UNKNOWN'
    },
    utcOffsetMinutes: 60
  },
  request: {
    internalExperimentFlags: [
      {
        key: 'force_music_enable_outertube_tastebuilder_browse',
        value: 'true'
      },
      {
        key: 'force_music_enable_outertube_playlist_detail_browse',
        value: 'true'
      },
      {
        key: 'force_music_enable_outertube_search_suggestions',
        value: 'true'
      }
    ],
    sessionIndex: {}
  },
  user: {
    enableSafetyMode: false
  }
}
