package org.openremote.agent.protocol.twitch;

import org.openremote.agent.protocol.AbstractProtocol;
import org.openremote.model.Container;
import org.openremote.model.attribute.Attribute;
import org.openremote.model.attribute.AttributeEvent;

public class TwitchProtocol extends AbstractProtocol<TwitchAgent, TwitchAgentLink> {

    public TwitchProtocol(TwitchAgent agent) {
        super(agent);
    }

    @Override
    protected void doStart(Container container) throws Exception {

    }

    @Override
    protected void doStop(Container container) throws Exception {

    }

    @Override
    protected void doLinkAttribute(String assetId, Attribute<?> attribute, TwitchAgentLink agentLink) throws RuntimeException {

    }

    @Override
    protected void doUnlinkAttribute(String assetId, Attribute<?> attribute, TwitchAgentLink agentLink) {

    }

    @Override
    protected void doLinkedAttributeWrite(Attribute<?> attribute, TwitchAgentLink agentLink, AttributeEvent event, Object processedValue) {

    }

    @Override
    public String getProtocolName() {
        return "";
    }

    @Override
    public String getProtocolInstanceUri() {
        return "";
    }
}
