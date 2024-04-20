package org.openremote.agent.protocol.twitch;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.openremote.model.asset.agent.AgentLink;

import java.util.Optional;

public class TwitchAgentLink extends AgentLink<TwitchAgentLink> {

    @JsonPropertyDescription("Specifies what API type to use, such as Helix or PubSub.")
    protected TwitchApiCommand command;

    @JsonPropertyDescription("Attribute to write towards to. If null, it will write to the same attribute.")
    protected String pollingAttribute;

    // For Hydrators
    protected TwitchAgentLink() {
    }

    public TwitchAgentLink(String id) {
        super(id);
    }

    public Optional<TwitchApiCommand> getCommand() {
        return Optional.ofNullable(command);
    }
    public TwitchAgentLink setCommand(TwitchApiCommand command) {
        this.command = command;
        return this;
    }

    public Optional<String> getPollingAttribute() {
        return Optional.ofNullable(pollingAttribute);
    }
    public TwitchAgentLink setPollingAttribute(String pollingAttribute) {
        this.pollingAttribute = pollingAttribute;
        return this;
    }
}
