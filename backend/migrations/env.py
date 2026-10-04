from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from app.core.config import settings
from app.database.base import Base
from app.models.user import User
from app.models.user import User
from app.models.athlete import AthleteProfile
from app.models.sport import Sport
from app.models.athlete_sport import AthleteSport
from app.models.session import VideoSession
from app.models.sport_metric import SportMetric
from app.models.athlete_attribute import AthleteAttribute
from app.models.progress import AthleteProgress
from app.models.recovery import RecoveryMetric

from app.models.training import (
    TrainingPlan,
    Workout,
)

from app.models.shadow import ShadowChallenge

from app.models.record import PersonalRecord

from app.models.achievement import (
    Achievement,
    AthleteAchievement,
)
from app.models.xp import XPEvent
from app.models.shadow_test import ShadowTest
from app.models.movement import MovementBaseline
from app.models.risk_signal import RiskSignal
from app.models.sport_transfer import SportTransfer
from app.models.analysis import SessionAnalysis
from app.models.explanation import PerformanceExplanation
from app.models.highlight import PerformanceHighlight
from app.models.coach import (
    CoachMessage,
    CoachRecommendation,
)

from app.models.coach_relationship import (
    CoachAthleteRelationship,
)

from app.models.challenge import (
    Challenge,
    ChallengeParticipant,
)

from app.models.technique_replay import (
    TechniqueReplay,
)

from app.models.reference import (
    SportReferenceRange,
)

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

config.set_main_option(
    "sqlalchemy.url",
    settings.database_url,
)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
