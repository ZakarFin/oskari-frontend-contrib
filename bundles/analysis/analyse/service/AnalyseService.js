import { Messaging } from 'oskari-ui/util';
/**
 * @class Oskari.analysis.bundle.analyse.AnalyseService
 * Methods for sending out analysis data to backend
 */
Oskari.clazz.define(
    'Oskari.analysis.bundle.analyse.service.AnalyseService',

    /**
     * @static @method create called automatically on construction
     *
     *
     */
    function (instance) {
        this.instance = instance;
        this.sandbox = instance.getSandbox();
        this.mapLayerService = this.sandbox.getService('Oskari.mapframework.service.MapLayerService');
        this.loc = instance.loc;
    }, {
        __name: 'Analyse.AnalyseService',
        __qname: 'Oskari.analysis.bundle.analyse.service.AnalyseService',

        getQName: function () {
            return this.__qname;
        },
        getName: function () {
            return this.__name;
        },
        init: function () {

        },
        sendAnalyseData: function (data, showOptions) {
            this.sandbox.postRequestByName('ShowProgressSpinnerRequest', [true]);
            fetch(Oskari.urls.getRoute('CreateAnalysisLayer'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'Accept': 'application/json'
                },
                // TODO: backend assumes to receive string content -> refactor to use json
                body: Object.keys(data).map(key => `${key}=${data[key]}`).join('&')
            }).then(response => {
                this.sandbox.postRequestByName('ShowProgressSpinnerRequest', [false]);
                if (!response.ok) {
                    throw new Error(response.statusText); //error
                }
                return response.json();
            }).then(json => {
                if (json.error) {
                    throw new Error(json.error);
                }
                this._handleSuccess(json, showOptions);
            }).catch(error => {
                const locObj = this.loc('AnalyseView.error');
                Messaging.error(locObj[error] || locObj.saveFailed);
            });
        },
        _handleSuccess: function (json, showOptions) {
            const { featureData, noSave, ...aggregateOpts } = showOptions;
            if (noSave) {
                this.instance.getStateHandler().openAggregateResults(json.aggregate, aggregateOpts);
                return;
            }
            // TODO: backend { layer, mergeLayers }
            const { id, locale, mergeLayers = [] } = json;
            this._addLayerToService(json);
            // Add layer to the map
            this.sandbox.postRequestByName('AddMapLayerRequest', [id]);
            if (featureData) {
                this.sandbox.postRequestByName('ShowFeatureDataRequest', [id]);
            }
            // Remove old layers from map and map layer service
            mergeLayers.forEach(layerId => {
                this.mapLayerService.removeLayer(layerId);
                this.sandbox.postRequestByName('RemoveMapLayerRequest', [layerId]);
            });

            const layer = Oskari.getLocalized(locale)?.name || '';
            Messaging.success(this.loc('AnalyseView.success.layerAdded', { layer }));
        },

        loadAnalyseLayers: function () {
            fetch(Oskari.urls.getRoute('GetAnalysisLayers'), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }).then(json => {
                this._handleAnalysisLayersResponse(json.analysislayers);
            }).catch(() => {
                Messaging.error(this.loc('AnalyseView.error.loadLayersFailed'));
            });
        },
        _addLayerToService: function (layerJson, suppressEvent) {
            // Create the layer model
            const layer = this.mapLayerService.createMapLayer(layerJson);
            // Add the layer to the map layer service
            this.mapLayerService.addLayer(layer, suppressEvent);
        },
        _handleAnalysisLayersResponse: function (layers = []) {
            layers.forEach(layer => this._addLayerToService(layer, true));
            if (layers.length) {
                // null as id triggers mass update
                const event = Oskari.eventBuilder('MapLayerEvent')(null, 'add');
                this.sandbox.notifyAll(event);
            }
        }
    }, {
        protocol: ['Oskari.mapframework.service.Service']
    }
);
