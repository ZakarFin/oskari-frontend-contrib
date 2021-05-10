/*
 * @class Oskari.mapframework.bundle.mapanalysis.domain.AnalysisLayerModelBuilder
 * JSON-parsing for analysis layer
 */
Oskari.clazz.define('Oskari.mapframework.bundle.mapanalysis.domain.AnalysisLayerModelBuilder', function (sandbox) {
    this.localization = Oskari.getLocalization('MapAnalysis');
    this.sandbox = sandbox;
    this.wfsBuilder = Oskari.clazz.create('Oskari.mapframework.bundle.mapwfs2.domain.WfsLayerModelBuilder', sandbox);
    // created in parseLayer so it can be used to detect if we have already done it
    this.groupId = null;
}, {
    _getAnalyseService: function () {
        return this.sandbox.getService('Oskari.analysis.bundle.analyse.service.AnalyseService');
    },
    _createFilterTool: function (layer) {
        const filterdataTool = Oskari.clazz.create('Oskari.mapframework.domain.Tool');
        filterdataTool.setName('filterdata');
        filterdataTool.setIconCls('show-filter-tool');
        filterdataTool.setTooltip(this.localization.filterTooltip);
        filterdataTool.setCallback(() => {
            const service = this._getAnalyseService();
            const isAggregateValueAvailable = !!service;
            const fixedOptions = {
                bboxSelection: true,
                clickedFeaturesSelection: false,
                addLinkToAggregateValues: isAggregateValueAvailable
            };

            const filterDialog = Oskari.clazz.create('Oskari.userinterface.component.FilterDialog', fixedOptions);
            filterDialog.setUpdateButtonHandler((filters) => {
                // throw event to new wfs
                const filteringChangeEvent = Oskari.eventBuilder('WFSSetPropertyFilter');
                this.sandbox.notifyAll(filteringChangeEvent(filters, layer.getId()));
            });

            if (isAggregateValueAvailable) {
                const aggregateAnalyseFilter = Oskari.clazz.create('Oskari.analysis.bundle.analyse.aggregateAnalyseFilter', filterDialog);

                filterDialog.createFilterDialog(layer, null, () =>  {
                    // FIXME: why is bind() used here? can it be removed?
                    service._returnAnalysisOfTypeAggregate((listOfAggregateAnalysis) => aggregateAnalyseFilter.addAggregateFilterFunctionality(listOfAggregateAnalysis));
                });
            } else {
                filterDialog.createFilterDialog(layer);
            }
            filterDialog.setCloseButtonHandler(() => {
                filterDialog.popup.dialog.off('click', '.add-link');
            });
        });
        return filterdataTool;
    },
    /**
     * parses any additional fields to model
     * @param {Oskari.mapframework.bundle.mapanalysis.domain.AnalysisLayer} layer partially populated layer
     * @param {Object} mapLayerJson JSON presentation of the layer
     * @param {Oskari.mapframework.service.MapLayerService} maplayerService not really needed here
     */
    parseLayerData: function (layer, mapLayerJson, maplayerService) {
        if (layer.isFilterSupported()) {
            layer.addTool(this._createFilterTool(layer));
        }
        const loclayer = this.localization.layer;

        // call parent parseLayerData
        this.wfsBuilder.parseLayerData(layer, mapLayerJson, maplayerService);

        if (mapLayerJson.wpsName) {
            layer.setWpsName(mapLayerJson.wpsName);
        }
        if (mapLayerJson.wpsUrl) {
            layer.setWpsUrl(mapLayerJson.wpsUrl);
        }
        if (mapLayerJson.wpsLayerId) {
            layer.setWpsLayerId(mapLayerJson.wpsLayerId);
        }
        if (loclayer.organization) {
            layer.setOrganizationName(loclayer.organization);
        }
        if (!this.groupId) {
            // negative value for group id means that admin isn't presented with tools for it
            this.groupId = -1 * Oskari.seq.nextVal('usergeneratedGroup');
            // initialize the group these layers will be in:
            const mapLayerGroup = maplayerService.getAllLayerGroups(this.groupId);
            if (!mapLayerGroup) {
                const group = {
                    id: this.groupId,
                    name: {
                        [Oskari.getLang()]: loclayer.inspire
                    }
                };
                maplayerService.addLayerGroup(Oskari.clazz.create('Oskari.mapframework.domain.MaplayerGroup', group));
            }
        }
        if (loclayer.inspire) {
            layer.setGroups([{
                id: this.groupId,
                name: loclayer.inspire
            }]);
        }
    }
});
