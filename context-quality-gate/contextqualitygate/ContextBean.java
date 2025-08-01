package contextqualitygate;

public interface ContextBean {
    String getRole();
    void setRole(String role);
    String getTask();
    void setTask(String task);
    String getDependencies();
    void setDependencies(String dependencies);
    String getUserFeedback();
    void setUserFeedback(String userFeedback);
    String getProcessRules();
    void setProcessRules(String processRules);
    void initFromJson(String scenario);
}

class DefaultContextBean implements ContextBean {
    private String role;
    private String task;
    private String dependencies;
    private String userFeedback;
    private String processRules;

    public DefaultContextBean() {
        // No-argument constructor
    }

    @Override
    public void initFromJson(String scenario) {
        // Simple JSON parsing (assumes flat structure, no nested objects)
        scenario = scenario.trim().replaceAll("[{}\"]", "");
        String[] pairs = scenario.split(",");
        for (String pair : pairs) {
            String[] kv = pair.split(":");
            if (kv.length == 2) {
                String key = kv[0].trim();
                String value = kv[1].trim();
                switch (key) {
                    case "role": this.role = value; break;
                    case "task": this.task = value; break;
                    case "dependencies": this.dependencies = value; break;
                    case "userFeedback": this.userFeedback = value; break;
                    case "processRules": this.processRules = value; break;
                }
            }
        }
    }

    @Override
    public String getRole() { return role; }
    @Override
    public void setRole(String role) { this.role = role; }
    @Override
    public String getTask() { return task; }
    @Override
    public void setTask(String task) { this.task = task; }
    @Override
    public String getDependencies() { return dependencies; }
    @Override
    public void setDependencies(String dependencies) { this.dependencies = dependencies; }
    @Override
    public String getUserFeedback() { return userFeedback; }
    @Override
    public void setUserFeedback(String userFeedback) { this.userFeedback = userFeedback; }
    @Override
    public String getProcessRules() { return processRules; }
    @Override
    public void setProcessRules(String processRules) { this.processRules = processRules; }
}
