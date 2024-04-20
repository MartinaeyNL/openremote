package org.openremote.agent.protocol.twitch;

import jakarta.persistence.Entity;
import org.openremote.model.asset.agent.Agent;
import org.openremote.model.asset.agent.AgentDescriptor;
import org.openremote.model.value.AttributeDescriptor;
import org.openremote.model.value.ValueType;

import java.util.Optional;

@Entity
public class TwitchAgent extends Agent<TwitchAgent, TwitchProtocol, TwitchAgentLink> {

    public static final AttributeDescriptor<String> CLIENT_ID = new AttributeDescriptor<>("clientId", ValueType.TEXT);
    public static final AttributeDescriptor<String> CLIENT_SECRET = new AttributeDescriptor<>("clientSecret", ValueType.TEXT);
    public static final AttributeDescriptor<String> ACCESS_TOKEN = new AttributeDescriptor<>("accessToken", ValueType.TEXT);
    public static final AttributeDescriptor<String> REFRESH_TOKEN = new AttributeDescriptor<>("refreshToken", ValueType.TEXT);

    public static final AttributeDescriptor<String> USER_ID = new AttributeDescriptor<>("channelUserId", ValueType.TEXT);
    public static final AttributeDescriptor<String> USERNAME = new AttributeDescriptor<>("channelUsername", ValueType.TEXT);

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

    public Optional<String> getClientId() {
        return getAttributes().getValue(CLIENT_ID);
    }

    public Optional<String> getClientSecret() {
        return getAttributes().getValue(CLIENT_SECRET);
    }

    public Optional<String> getAccessToken() {
        return getAttributes().getValue(ACCESS_TOKEN);
    }

    public Optional<String> getRefreshToken() {
        return getAttributes().getValue(REFRESH_TOKEN);
    }

    public Optional<String> getUserId() {
        return getAttributes().getValue(USER_ID);
    }

    public Optional<String> getUsername() {
        return getAttributes().getValue(USERNAME);
    }

    @Override
    public TwitchProtocol getProtocolInstance() {
        return new TwitchProtocol(this);
    }
}
