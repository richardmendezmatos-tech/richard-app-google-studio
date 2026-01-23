package com.richard.events;

import jdk.jfr.Category;
import jdk.jfr.Description;
import jdk.jfr.Event;
import jdk.jfr.Label;
import jdk.jfr.Name;

@Name("com.richard.LeadTransition")
@Label("Lead State Transition")
@Category({ "Richard Automotive", "Domain" })
@Description("Tracks transitions between lead states in the lifecycle")
public class LeadTransitionEvent extends Event {
    @Label("From State")
    public String fromState;

    @Label("To State")
    public String toState;

    @Label("Lead ID")
    public String leadId;

    @Label("Lead Score")
    public int score;
}
