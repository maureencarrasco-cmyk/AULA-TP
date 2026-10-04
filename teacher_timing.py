"""Coverage from recorded teacher timings, never from planned capacity."""
import math
from datetime import datetime

PHASES = ('reading', 'resources', 'solving', 'writing')


def timing_summary(required_ids, records, available_minutes):
    required_ids = list(required_ids)
    if any(not isinstance(activity, str) or not activity.strip() for activity in required_ids):
        raise ValueError('Activity identifiers must be nonempty strings')
    required = set(required_ids)
    if len(required) != len(required_ids):
        raise ValueError('Repeated required activity')
    measured = {}
    for record in records:
        activity = record.get('activity_id')
        if activity not in required or activity in measured:
            raise ValueError('Unknown or repeated activity')
        if record.get('role') != 'teacher' or not str(record.get('measured_at') or '').strip():
            raise ValueError('Teacher role and measurement date required')
        try:
            datetime.fromisoformat(record['measured_at'])
        except (ValueError, TypeError):
            raise ValueError('Measurement date must be a valid ISO date or timestamp') from None
        if record.get('status') != 'measured':
            raise ValueError('Only real measurements accepted')
        phases = record.get('minutes') or {}
        values = [phases.get(phase) for phase in PHASES]
        if any(type(value) not in (int, float) or not math.isfinite(value) or value < 0 for value in values):
            raise ValueError('All four phases require finite nonnegative minutes')
        if sum(values) <= 0:
            raise ValueError('Measurement must have positive duration')
        if not math.isfinite(sum(values)):
            raise ValueError('Measurement duration must be finite')
        measured[activity] = sum(values)
    if not math.isfinite(sum(measured.values())) or not math.isfinite(sum(measured.values()) * 6):
        raise ValueError('Total and scaled durations must be finite')
    complete = bool(required) and required == set(measured)
    budget_valid = type(available_minutes) in (int, float) and math.isfinite(available_minutes) and available_minutes > 0
    total = sum(measured.values()) if complete else None
    sensitivity = {}
    for factor in (3, 4, 5, 6):
        minutes = total * factor if total is not None else None
        sensitivity[str(factor)] = {'student_minutes': minutes,
            'occupancy_percent': round(minutes / available_minutes * 100, 2) if minutes is not None and budget_valid else None,
            'difference_minutes': minutes - available_minutes if minutes is not None and budget_valid else None}
    return {'required_activities': len(required), 'measured_activities': len(measured),
            'missing_activity_ids': sorted(required - set(measured)),
            'complete': complete, 'teacher_minutes': total,
            'partial_teacher_minutes': sum(measured.values()), 'sensitivity': sensitivity,
            'budget_source_requires_review': True}
