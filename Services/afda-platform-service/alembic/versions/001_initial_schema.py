"""Initial platform schema - all 11 tables.

Revision ID: 001_initial_schema
Revises: None
Create Date: 2025-01-15 00:00:00

Tables:
  Identity: customer, organization, organization_currency,
            platform_user, role, user_organization
  Access:   org_access_policy
  Config:   api_key, data_connection, platform_setting, audit_log
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -- customer --
    op.create_table(
        'customer',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(300), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('legal_name', sa.String(500), nullable=True),
        sa.Column('industry', sa.String(100), nullable=True),
        sa.Column('plan', sa.String(50), server_default='free'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('default_organization_id', UUID(as_uuid=True), nullable=True),
        sa.Column('config_json', JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
    )

    # -- organization --
    op.create_table(
        'organization',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('name', sa.String(300), nullable=False),
        sa.Column('code', sa.String(20), nullable=False),
        sa.Column('legal_entity_name', sa.String(500), nullable=True),
        sa.Column('country', sa.String(3), nullable=True),
        sa.Column('timezone', sa.String(50), server_default='America/New_York'),
        sa.Column('fiscal_year_end_month', sa.SmallInteger, server_default='12'),
        sa.Column('default_currency_code', sa.String(3), server_default='USD'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('is_default', sa.Boolean, server_default='false'),
        sa.Column('settings_json', JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
        sa.UniqueConstraint('customer_id', 'code', name='uq_org_customer_code'),
    )
    op.create_index('idx_org_customer', 'organization', ['customer_id'])

    # -- organization_currency --
    op.create_table(
        'organization_currency',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('currency_code', sa.String(3), nullable=False),
        sa.Column('is_primary', sa.Boolean, server_default='false'),
        sa.Column('is_reporting', sa.Boolean, server_default='false'),
        sa.Column('exchange_rate_source', sa.String(50), server_default='manual'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.UniqueConstraint('organization_id', 'currency_code', name='uq_org_currency'),
    )
    op.create_index('idx_orgcurr_org', 'organization_currency', ['organization_id'])

    # -- platform_user --
    op.create_table(
        'platform_user',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('email', sa.String(300), unique=True, nullable=False),
        sa.Column('display_name', sa.String(200), nullable=False),
        sa.Column('password_hash', sa.String(500), nullable=False),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('is_customer_admin', sa.Boolean, server_default='false'),
        sa.Column('last_login_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_user_customer', 'platform_user', ['customer_id'])
    op.create_index('idx_user_email', 'platform_user', ['email'])

    # -- role --
    op.create_table(
        'role',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('permissions_json', JSONB, server_default='{}'),
        sa.Column('is_system', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_role_customer', 'role', ['customer_id'])

    # -- user_organization --
    op.create_table(
        'user_organization',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=False),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('role_id', UUID(as_uuid=True), sa.ForeignKey('role.id'), nullable=False),
        sa.Column('is_default', sa.Boolean, server_default='false'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id', 'organization_id', name='uq_user_org'),
    )
    op.create_index('idx_userog_user', 'user_organization', ['user_id'])
    op.create_index('idx_userog_org', 'user_organization', ['organization_id'])

    # -- org_access_policy --
    op.create_table(
        'org_access_policy',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('from_organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('to_organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('domain', sa.String(50), nullable=False),
        sa.Column('row_type', sa.String(20), nullable=False),
        sa.Column('access_level', sa.String(20), server_default='view'),
        sa.Column('access_config_json', JSONB, server_default='{}'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('granted_by_user_id', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=True),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
        sa.UniqueConstraint(
            'from_organization_id', 'to_organization_id', 'domain', 'row_type',
            name='uq_access_policy'
        ),
        sa.CheckConstraint(
            'from_organization_id != to_organization_id',
            name='ck_no_self_sharing'
        ),
    )
    op.create_index('idx_access_from_org', 'org_access_policy', ['from_organization_id'])
    op.create_index('idx_access_to_org', 'org_access_policy', ['to_organization_id'])
    op.create_index('idx_access_customer', 'org_access_policy', ['customer_id'])

    # -- api_key --
    op.create_table(
        'api_key',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('key_prefix', sa.String(20), nullable=False),
        sa.Column('key_hash', sa.String(64), nullable=False),
        sa.Column('scopes', JSONB, server_default='[]'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('created_by', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('last_used_at', sa.DateTime, nullable=True),
    )
    op.create_index('idx_apikey_customer', 'api_key', ['customer_id'])
    op.create_index('idx_apikey_prefix', 'api_key', ['key_prefix'])

    # -- data_connection --
    op.create_table(
        'data_connection',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('connection_type', sa.String(50), nullable=False),
        sa.Column('provider', sa.String(100), nullable=True),
        sa.Column('config_json', JSONB, server_default='{}'),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('sync_frequency', sa.String(20), server_default='daily'),
        sa.Column('last_sync_at', sa.DateTime, nullable=True),
        sa.Column('last_error', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_dataconn_customer', 'data_connection', ['customer_id'])

    # -- platform_setting --
    op.create_table(
        'platform_setting',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=True),
        sa.Column('organization_id', UUID(as_uuid=True), sa.ForeignKey('organization.id'), nullable=True),
        sa.Column('key', sa.String(200), nullable=False),
        sa.Column('value', sa.Text, nullable=True),
        sa.Column('category', sa.String(50), server_default='general'),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('updated_by', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=True),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_setting_lookup', 'platform_setting', ['customer_id', 'organization_id', 'key'])

    # -- audit_log --
    op.create_table(
        'audit_log',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('customer_id', UUID(as_uuid=True), sa.ForeignKey('customer.id'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('platform_user.id'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),
        sa.Column('resource_id', sa.String(100), nullable=True),
        sa.Column('details_json', JSONB, server_default='{}'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('actor_email', sa.String(300), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()')),
    )
    op.create_index('idx_audit_customer', 'audit_log', ['customer_id'])
    op.create_index('idx_audit_user', 'audit_log', ['user_id'])
    op.create_index('idx_audit_action', 'audit_log', ['action'])


def downgrade() -> None:
    op.drop_table('audit_log')
    op.drop_table('platform_setting')
    op.drop_table('data_connection')
    op.drop_table('api_key')
    op.drop_table('org_access_policy')
    op.drop_table('user_organization')
    op.drop_table('role')
    op.drop_table('platform_user')
    op.drop_table('organization_currency')
    op.drop_table('organization')
    op.drop_table('customer')
