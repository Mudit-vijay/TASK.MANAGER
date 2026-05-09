package Algorithm.scheduler.Service.impl;

import Algorithm.scheduler.DataModel.Schedule;
import Algorithm.scheduler.DataModel.ScheduledTask;
import Algorithm.scheduler.DataModel.TaskModel;
import Algorithm.scheduler.DataModel.SchedulingPolicy;
import Algorithm.scheduler.Service.SchedulerAlgorithm;
import Algorithm.scheduler.Service.WeightageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service("backtrackingScheduler")
public class BacktrackingScheduler implements SchedulerAlgorithm {

    @Autowired
    private WeightageService weightageService;

    @Override
    public List<ScheduledTask> generateSchedule(List<TaskModel> tasks, Schedule constraints, SchedulingPolicy policy) {
        List<ScheduledTask> currentSchedule = new ArrayList<>();
        Set<String> completedTaskIds = new HashSet<>();
        
        if (solve(tasks, constraints, policy, 0, currentSchedule, completedTaskIds)) {
            return currentSchedule;
        }
        
        return Collections.emptyList();
    }

    private boolean solve(List<TaskModel> tasks, Schedule constraints, SchedulingPolicy policy, 
                          int currentTime, List<ScheduledTask> currentSchedule, Set<String> completedTaskIds) {
        
        if (completedTaskIds.size() == tasks.size()) {
            return true;
        }

        List<TaskModel> availableTasks = getAvailableTasks(tasks, completedTaskIds);
        
        // Dynamic Heuristic Sorting based on Policy
        sortAvailableTasks(availableTasks, policy);

        for (TaskModel task : availableTasks) {
            int taskEndTime = currentTime + task.getEstimated_duration();
            
            if (taskEndTime <= task.getDeadline() && taskEndTime <= constraints.getTotalHours()) {
                
                ScheduledTask scheduledTask = new ScheduledTask(task, currentTime, taskEndTime);
                currentSchedule.add(scheduledTask);
                completedTaskIds.add(task.getTaskId());

                if (solve(tasks, constraints, policy, taskEndTime, currentSchedule, completedTaskIds)) {
                    return true;
                }

                completedTaskIds.remove(task.getTaskId());
                currentSchedule.remove(currentSchedule.size() - 1);
            }
        }

        return false;
    }

    private void sortAvailableTasks(List<TaskModel> availableTasks, SchedulingPolicy policy) {
        String goal = policy.getOptimizationGoal() != null ? policy.getOptimizationGoal() : "BALANCED";
        
        switch (goal.toUpperCase()) {
            case "DEADLINE_FIRST":
                availableTasks.sort(Comparator.comparingInt(TaskModel::getDeadline));
                break;
            case "PRIORITY_FIRST":
                availableTasks.sort((t1, t2) -> Integer.compare(
                    weightageService.getPriorityWeight(t2, policy), 
                    weightageService.getPriorityWeight(t1, policy)));
                break;
            case "BALANCED":
            default:
                // Sort by total weightage score
                availableTasks.sort((t1, t2) -> {
                    int w1 = weightageService.getPriorityWeight(t1, policy) + weightageService.getDeadlineWeight(t1, policy);
                    int w2 = weightageService.getPriorityWeight(t2, policy) + weightageService.getDeadlineWeight(t2, policy);
                    return Integer.compare(w2, w1);
                });
                break;
        }
    }

    private List<TaskModel> getAvailableTasks(List<TaskModel> tasks, Set<String> completedTaskIds) {
        return tasks.stream()
                .filter(t -> !completedTaskIds.contains(t.getTaskId()))
                .filter(t -> isDependenciesMet(t, completedTaskIds))
                .collect(Collectors.toList());
    }

    private boolean isDependenciesMet(TaskModel task, Set<String> completedTaskIds) {
        List<TaskModel> dependencies = task.getTaskDependency();
        if (dependencies == null || dependencies.isEmpty()) {
            return true;
        }
        return dependencies.stream().allMatch(d -> completedTaskIds.contains(d.getTaskId()));
    }
}
