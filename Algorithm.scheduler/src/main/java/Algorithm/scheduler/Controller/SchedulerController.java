package Algorithm.scheduler.Controller;

import Algorithm.scheduler.DataModel.ScheduledTask;
import Algorithm.scheduler.DataModel.SchedulingRequest;
import Algorithm.scheduler.Service.SchedulerConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/scheduler")
public class SchedulerController {

    @Autowired
    private SchedulerConfigService schedulerService;

    /**
     * Endpoint to generate a task schedule.
     * Accessible via the API Gateway.
     */
    @PostMapping("/generate")
    public ResponseEntity<List<ScheduledTask>> generateSchedule(@RequestBody SchedulingRequest request) {
        List<ScheduledTask> schedule = schedulerService.runScheduler(
                request.getTasks(),
                request.getConstraints(),
                request.getPolicy(),
                request.getAlgorithmType()
        );

        if (schedule.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Scheduler Service is up and running on port 9001!");
    }
}
