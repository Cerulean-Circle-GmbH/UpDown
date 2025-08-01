package contextqualitygate;

public class ContextBean {
    private String role;
    private String task;
    private String dependencies;
    private String userFeedback;
    private String processRules;

    public ContextBean(String role, String task, String dependencies, String userFeedback, String processRules) {
        this.role = role;
        this.task = task;
        this.dependencies = dependencies;
        this.userFeedback = userFeedback;
        this.processRules = processRules;
    }

    public String getRole() { return role; }
    public String getTask() { return task; }
    public String getDependencies() { return dependencies; }
    public String getUserFeedback() { return userFeedback; }
    public String getProcessRules() { return processRules; }
}
