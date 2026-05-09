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

@Service("branchAndBoundScheduler")
public class BranchAndBoundScheduler implements SchedulerAlgorithm {

    @Autowired
    private WeightageService weightageService;

    private List<ScheduledTask> bestSchedule;
    private int maxWeight;

    @Override
    public List<ScheduledTask> generateSchedule(List<TaskModel> tasks, Schedule constraints, SchedulingPolicy policy) {
        this.bestSchedule = new ArrayList<>();
        this.maxWeight = -1;
        
        List<ScheduledTask> currentSchedule = new ArrayList<>();
        Set<String> completedTaskIds = new HashSet<>();
        
        solve(tasks, constraints, policy, 0, currentSchedule, completedTaskIds, 0);
        
        return bestSchedule;
    }

    private void solve(List<TaskModel> tasks, Schedule constraints, SchedulingPolicy policy, 
                       int currentTime, List<ScheduledTask> currentSchedule, Set<String> completedTaskIds, int currentWeight) {
        
        if (completedTaskIds.size() == tasks.size()) {
            if (currentWeight > maxWeight) {
                maxWeight = currentWeight;
                bestSchedule = new ArrayList<>(currentSchedule);
            }
            return;
        }

        List<TaskModel> availableTasks = getAvailableTasks(tasks, completedTaskIds);
        
        int potentialMaxWeight = currentWeight + calculateRemainingMaxWeight(availableTasks, policy);
        
        if (potentialMaxWeight <= maxWeight) {
            return;
        }

        // Sort by dynamic weightage to explore high-value branches first
        availableTasks.sort((t1, t2) -> Integer.compare(
            calculateTaskWeight(t2, policy), 
            calculateTaskWeight(t1, policy)));

        for (TaskModel task : availableTasks) {
            int taskEndTime = currentTime + task.getEstimated_duration();
            
            if (taskEndTime <= task.getDeadline() && taskEndTime <= constraints.getTotalHours()) {
                
                int taskWeight = calculateTaskWeight(task, policy);
                
                ScheduledTask scheduledTask = new ScheduledTask(task, currentTime, taskEndTime);
                currentSchedule.add(scheduledTask);
                completedTaskIds.add(task.getTaskId());

                solve(tasks, constraints, policy, taskEndTime, currentSchedule, completedTaskIds, currentWeight + taskWeight);

                completedTaskIds.remove(task.getTaskId());
                currentSchedule.remove(currentSchedule.size() - 1);
            }
        }
    }

    private int calculateTaskWeight(TaskModel task, SchedulingPolicy policy) {
        return weightageService.getPriorityWeight(task, policy) + 
               weightageService.getDeadlineWeight(task, policy) + 
               weightageService.getUnLockedTaskWeigt(task, policy);
    }

    private int calculateRemainingMaxWeight(List<TaskModel> remainingTasks, SchedulingPolicy policy) {
        int total = 0;
        for (TaskModel t : remainingTasks) {
            total += calculateTaskWeight(t, policy);
        }
        return total;
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
