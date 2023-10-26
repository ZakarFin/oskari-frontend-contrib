import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Controller, ThemeProvider } from 'oskari-ui/util';
import { Collapse, CollapsePanel, Message, Radio, Select, Option } from 'oskari-ui';
import { ButtonContainer, PrimaryButton, SecondaryButton } from 'oskari-ui/components/buttons';
import { InfoIcon } from 'oskari-ui/components/icons';

import { Layers } from './Layers';
import { Tools } from './Tools';
import { Methods } from './Methods';
import { Params } from './Params';
import { Styles } from './Styles';

import { BUNDLE_KEY } from './constants';

const Content = styled('div')``;

const StyledPanelHeader = styled('div')`
    display: inline-flex;
    flex-direction: row;
    font-weight: bold;
`;

const RadioGroup = styled(Radio.Group)`
    display: flex;
    flex-direction: column;
`;

const Actions = styled(ButtonContainer)`
    padding-right: 15px;
`;

const PanelHeader = ({ headerMsg, infoMsg }) => {
    return (
        <StyledPanelHeader>
            <Message messageKey={headerMsg} />
            {infoMsg && <InfoIcon title={<Message messageKey={infoMsg} />} /> }
        </StyledPanelHeader>
    );
}

export const PrintoutPanel = ({ controller, state, onClose, layers }) => {
    const [openPanels, setOpenPanels] = useState(['layers', 'tools', 'methods', 'params']); // params or settings??, styles or output??
    const allLayers = [...layers, ...state.tempLayers ];
    return (
        <ThemeProvider>
            <Content>
                <Collapse defaultActiveKey={openPanels} onChange={setOpenPanels}>
                    <CollapsePanel header={<PanelHeader headerMsg='AnalyseView.content.label' infoMsg='AnalyseView.content.tooltip'/>} key={'layers'}>
                        <Layers state={state} layers={allLayers} controller={controller} />
                    </CollapsePanel>
                    <CollapsePanel header={<PanelHeader headerMsg='AnalyseView.content.selectionToolsLabel' infoMsg='AnalyseView.content.selectionToolsTooltip'/>} key={'tools'}>
                        <Tools state={state} controller={controller} />
                    </CollapsePanel>
                    <CollapsePanel header={<PanelHeader headerMsg='AnalyseView.method.label' infoMsg='AnalyseView.method.tooltip'/>} key={'methods'}>
                        <Methods state={state} controller={controller} />
                    </CollapsePanel>
                    <CollapsePanel header={<PanelHeader headerMsg='AnalyseView.settings.label' infoMsg='AnalyseView.settings.tooltip'/>} key={'params'}>
                        <Params state={state} controller={controller} layers={allLayers} />
                    </CollapsePanel>
                    <CollapsePanel header={<PanelHeader headerMsg='AnalyseView.output.label' infoMsg='AnalyseView.output.tooltip'/>} key={'styles'}>
                        <Styles state={state} controller={controller} />
                    </CollapsePanel>
                </Collapse>
                <Actions>
                    <SecondaryButton onClick={onClose} type='cancel' />
                    <Button type='primary' className='t_button' onClick={() => controller.commitAnalysis()}>
                        <Message bundleKey='oskariui' messageKey={`buttons.${type}`}/>
                    </Button>
                </Actions>
            </Content>
        </ThemeProvider>
    );
};

PrintoutPanel.propTypes = {
    state: PropTypes.object.isRequired,
    controller: PropTypes.instanceOf(Controller).isRequired,
    onClose: PropTypes.func.isRequired,
    layers: PropTypes.array.isRequired
};
