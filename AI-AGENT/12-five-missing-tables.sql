BEGIN;

-- 1. AI Agent Sessions
CREATE TABLE IF NOT EXISTS agent_sessions_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES biz_businesses_biz_agent(id),

    user_id UUID NOT NULL
        REFERENCES auth_users_biz_agent(id),

    session_title VARCHAR(255),

    session_status VARCHAR(30) DEFAULT 'Active',

    started_at TIMESTAMPTZ DEFAULT NOW(),

    last_activity_at TIMESTAMPTZ DEFAULT NOW(),

    ended_at TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT agent_sessions_status_check
        CHECK (session_status IN ('Active', 'Completed', 'Archived'))
);


-- 2. AI Agent Messages
CREATE TABLE IF NOT EXISTS agent_messages_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES biz_businesses_biz_agent(id),

    session_id UUID NOT NULL
        REFERENCES agent_sessions_biz_agent(id),

    user_id UUID
        REFERENCES auth_users_biz_agent(id),

    sender_type VARCHAR(30) NOT NULL,

    message_content TEXT NOT NULL,

    message_metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT agent_messages_sender_check
        CHECK (sender_type IN ('User', 'Assistant', 'System', 'Tool'))
);


-- 3. AI Agent Tool Logs
CREATE TABLE IF NOT EXISTS agent_tool_logs_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES biz_businesses_biz_agent(id),

    session_id UUID
        REFERENCES agent_sessions_biz_agent(id),

    message_id UUID
        REFERENCES agent_messages_biz_agent(id),

    tool_name VARCHAR(150) NOT NULL,

    tool_input JSONB DEFAULT '{}'::JSONB,

    tool_output JSONB DEFAULT '{}'::JSONB,

    execution_status VARCHAR(30) DEFAULT 'Success',

    execution_time_ms INTEGER,

    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT agent_tool_logs_status_check
        CHECK (
            execution_status IN (
                'Success',
                'Failed',
                'Pending',
                'RequiresApproval'
            )
        ),

    CONSTRAINT agent_tool_logs_execution_time_check
        CHECK (execution_time_ms IS NULL OR execution_time_ms >= 0)
);


-- 4. AI Agent Reports
CREATE TABLE IF NOT EXISTS agent_reports_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES biz_businesses_biz_agent(id),

    generated_by UUID
        REFERENCES auth_users_biz_agent(id),

    report_type VARCHAR(100) NOT NULL,

    report_title VARCHAR(255) NOT NULL,

    report_parameters JSONB DEFAULT '{}'::JSONB,

    report_data JSONB DEFAULT '{}'::JSONB,

    report_status VARCHAR(30) DEFAULT 'Generated',

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT agent_reports_status_check
        CHECK (
            report_status IN (
                'Generated',
                'Failed',
                'Archived'
            )
        )
);


-- 5. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs_biz_agent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES biz_businesses_biz_agent(id),

    user_id UUID
        REFERENCES auth_users_biz_agent(id),

    action VARCHAR(150) NOT NULL,

    entity_type VARCHAR(100),

    entity_id UUID,

    old_values JSONB,

    new_values JSONB,

    ip_address VARCHAR(50),

    user_agent TEXT,

    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Indexes for efficient queries

CREATE INDEX IF NOT EXISTS idx_agent_sessions_business_user
ON agent_sessions_biz_agent(business_id, user_id);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_activity
ON agent_sessions_biz_agent(last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_messages_session
ON agent_messages_biz_agent(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_agent_messages_business
ON agent_messages_biz_agent(business_id);

CREATE INDEX IF NOT EXISTS idx_agent_tool_logs_session
ON agent_tool_logs_biz_agent(session_id);

CREATE INDEX IF NOT EXISTS idx_agent_tool_logs_business
ON agent_tool_logs_biz_agent(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_reports_business
ON agent_reports_biz_agent(business_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_business
ON audit_logs_biz_agent(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user
ON audit_logs_biz_agent(user_id);

COMMIT;