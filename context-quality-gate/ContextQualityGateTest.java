package contextqualitygate;

public class ContextQualityGateTest {
    public static void main(String[] args) {
        // Example: Hello World test
        ContextBean context = new ContextBean(
            "Scrum Master",
            "Task 12: GitHub Actions CI/CD for Dev Container",
            "Task 4, Task 7, Task 9",
            "No new feedback",
            "All process rules loaded"
        );
        printContext(context);
        boolean result = verifyContext(context);
        if (result) {
            System.out.println("Context Quality Gate PASSED. Ready for QA handover.");
        } else {
            System.out.println("Context Quality Gate FAILED. Please review context fields.");
        }
    }

    public static void printContext(ContextBean context) {
        System.out.println("--- Context Verification ---");
        System.out.println("Role: " + context.getRole());
        System.out.println("Task: " + context.getTask());
        System.out.println("Dependencies: " + context.getDependencies());
        System.out.println("User Feedback: " + context.getUserFeedback());
        System.out.println("Process Rules: " + context.getProcessRules());
        System.out.println("---------------------------");
    }

    public static boolean verifyContext(ContextBean context) {
        // Simple check: all fields must be non-empty
        return context.getRole() != null && !context.getRole().isEmpty()
            && context.getTask() != null && !context.getTask().isEmpty()
            && context.getDependencies() != null && !context.getDependencies().isEmpty()
            && context.getUserFeedback() != null && !context.getUserFeedback().isEmpty()
            && context.getProcessRules() != null && !context.getProcessRules().isEmpty();
    }
}
