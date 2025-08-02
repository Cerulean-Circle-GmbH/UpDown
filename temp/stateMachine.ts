type StatusState = "open" | "in-progress" | "qa-review" | "done" | "blocked";

class TaskStateMachine {
  private state: StatusState = "open";

  getState() {
    return this.state;
  }

  startProgress() {
    if (this.state === "open") {
      this.state = "in-progress";
    }
  }

  submitForQA() {
    if (this.state === "in-progress") {
      this.state = "qa-review";
    }
  }

  markDone() {
    if (this.state === "qa-review") {
      this.state = "done";
    }
  }

  block() {
    if (this.state !== "blocked" && this.state !== "done") {
      this.state = "blocked";
    }
  }

  unblock() {
    if (this.state === "blocked") {
      this.state = "open";
    }
  }
}

// Example usage:
const sm = new TaskStateMachine();
console.log(sm.getState()); // open
sm.startProgress();
console.log(sm.getState()); // in-progress
sm.submitForQA();
console.log(sm.getState()); // qa-review
sm.markDone();
console.log(sm.getState()); // done
sm.block(); // should not block if done
console.log(sm.getState()); // done
sm.unblock(); // should not unblock if not blocked
console.log(sm.getState()); // done
// Block and unblock test
const sm2 = new TaskStateMachine();
sm2.block();
console.log(sm2.getState()); // blocked
sm2.unblock();
console.log(sm2.getState()); // open
