import pandas as pd
import numpy as np

np.random.seed(42)
N = 1000

def generate_sample():
    samples = []
    for _ in range(N):
        risk = np.random.choice(['Low', 'Medium', 'High'], p=[0.45, 0.35, 0.20])

        if risk == 'Low':
            tasks_assigned     = np.random.randint(3, 8)
            tasks_completed    = np.random.randint(int(tasks_assigned * 0.8), tasks_assigned + 1)
            overdue_tasks      = np.random.randint(0, 2)
            carryover_tasks    = np.random.randint(0, 2)
            avg_completion_hrs = round(np.random.uniform(2.0, 5.0), 2)
            bug_reopened       = np.random.randint(0, 2)
            sprint_pressure    = round(np.random.uniform(0.2, 0.5), 2)

        elif risk == 'Medium':
            tasks_assigned     = np.random.randint(7, 13)
            tasks_completed    = np.random.randint(int(tasks_assigned * 0.5), int(tasks_assigned * 0.85))
            overdue_tasks      = np.random.randint(1, 4)
            carryover_tasks    = np.random.randint(1, 4)
            avg_completion_hrs = round(np.random.uniform(5.0, 9.0), 2)
            bug_reopened       = np.random.randint(1, 4)
            sprint_pressure    = round(np.random.uniform(0.5, 0.75), 2)

        else:
            tasks_assigned     = np.random.randint(12, 20)
            tasks_completed    = np.random.randint(0, int(tasks_assigned * 0.55))
            overdue_tasks      = np.random.randint(4, 10)
            carryover_tasks    = np.random.randint(3, 8)
            avg_completion_hrs = round(np.random.uniform(9.0, 16.0), 2)
            bug_reopened       = np.random.randint(3, 8)
            sprint_pressure    = round(np.random.uniform(0.75, 1.0), 2)

        samples.append({
            'tasks_assigned':     tasks_assigned,
            'tasks_completed':    min(tasks_completed, tasks_assigned),
            'overdue_tasks':      overdue_tasks,
            'carryover_tasks':    carryover_tasks,
            'avg_completion_hrs': avg_completion_hrs,
            'bug_reopened':       bug_reopened,
            'sprint_pressure':    sprint_pressure,
            'burnout_risk':       risk
        })
    return pd.DataFrame(samples)

if __name__ == '__main__':
    df = generate_sample()
    df.to_csv('dataset.csv', index=False)
    print(f"Dataset generated: {len(df)} records")
    print(df['burnout_risk'].value_counts())
