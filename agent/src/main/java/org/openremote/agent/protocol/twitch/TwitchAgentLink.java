package org.openremote.agent.protocol.twitch;

import org.openremote.model.asset.agent.AgentLink;

public class TwitchAgentLink extends AgentLink<TwitchAgentLink> {

    // For Hydrators
    protected TwitchAgentLink() {
    }

    public TwitchAgentLink(String id) {
        super(id);
    }
}
