package org.openremote.agent.protocol.twitch;

import jakarta.persistence.Entity;
import org.openremote.model.asset.agent.Agent;
import org.openremote.model.asset.agent.AgentDescriptor;

@Entity
public class TwitchAgent extends Agent<TwitchAgent, TwitchProtocol, TwitchAgentLink> {

    public static final AgentDescriptor<TwitchAgent, TwitchProtocol, TwitchAgentLink> DESCRIPTOR = new AgentDescriptor<>(
            TwitchAgent.class, TwitchProtocol.class, TwitchAgentLink.class
    );

    /**
     * For use by hydrators (i.e. JPA/Jackson)
     */
    protected TwitchAgent() {
    }

    public TwitchAgent(String name) {
        super(name);
    }


    @Override
    public TwitchProtocol getProtocolInstance() {
        return new TwitchProtocol(this);
    }
}
