# 🗼 Tower of Hanoi in C++ | Interactive DSA Learning Companion

> **Target Audience:** 2nd Year Computer Science / IT / B.Tech / BCA Students  
> **Course:** Data Structures & Algorithms (Semester 3) • Unit: Recursion & Divide and Conquer  
> 🌐 **Live Interactive Web Demo:** [https://bikexists.github.io/tower-of-hanoi-cpp/](https://bikexists.github.io/tower-of-hanoi-cpp/)

---

## 🌟 What is in This Project?

This repository contains a full-featured, zero-dependency **Interactive Web Project** and a companion **Production C++ Implementation** designed to give you a deep, intuitive understanding of the **Tower of Hanoi** problem.

### Key Highlights
1. 🎮 **Interactive Visual Simulator**:
   - Supports 1 to 7 disks.
   - **Auto-Solver Mode**: Step-by-step ("Next Step", "Prev Step", "Play/Pause", Speed control 0.25x – 3x).
   - **Manual Play Mode**: Drag-and-drop or click-to-move disks yourself, with move validation, move counter vs. optimal moves ($2^n - 1$), and a timer.
2. 📚 **Live Runtime Call Stack Visualizer**:
   - Visualizes activation records being pushed and popped in real time as recursive calls execute.
   - Understand why auxiliary space is only $O(n)$ despite $O(2^n)$ total operations.
3. 🌲 **Recursion Tree Visualizer**:
   - Dynamic binary tree showing the divide-and-conquer breakdown of the subproblems.
   - Highlighting of the currently active subproblem node.
4. 💻 **Synchronized C++ Line-by-Line Tracing**:
   - Live code editor highlighting the active line of C++ code corresponding to each visual move.
   - 3 implementations: **Recursive** (Syllabus Standard), **Iterative** (Explicit `std::stack`), and **Bitwise Formula** (Competitive Programming trick).
5. 📐 **University Exam Derivations & Mathematical Proofs**:
   - Recurrence relation: $T(n) = 2T(n-1) + 1$.
   - Full Repeated Substitution (Expansion) Method.
   - Mathematical Induction Proof.
   - Big-O, Big-$\Omega$, and Big-$\Theta$ complexity analysis.
   - Interactive real-world cosmic time calculator ($n = 1$ to $64$).
6. 🎯 **College Exam & Viva Kit + Interactive Quiz**:
   - 8 Frequently Asked Viva Questions with detailed answers.
   - 5-question interactive multiple-choice quiz with scoring and explanations.
7. 🔊 **Synthesized Web Audio**:
   - Built-in audio cues for disk movement and success without any external audio dependencies.

---

## 🚀 How to Run the Web Application

No Node.js or web server installation required! The project runs directly in any modern browser:

### Option A: Double Click
1. Navigate to the cloned folder:
   ```bash
   cd tower-of-hanoi-cpp
   ```
2. Double-click `index.html` to open it in Chrome, Edge, Firefox, or Brave.

### Option B: Local Server (Optional)
If you prefer running a local server:
```powershell
# Using Python
python -m http.server 8000

# Open in browser:
http://localhost:8000
```

---

## 💻 How to Compile and Run the C++ Code

The companion C++ file `hanoi.cpp` contains:
- The standard recursive syllabus implementation.
- An iterative implementation using an explicit `std::stack<StackFrame>` to show how the OS manages recursion.
- A bitwise observation module showing how the lowest set bit in step $k$ determines the disk moved.

### Compilation
Open PowerShell or your command prompt in this directory and run:

```bash
g++ -O2 -Wall hanoi.cpp -o hanoi.exe
```

### Execution
Run the compiled executable:
```bash
./hanoi.exe
```

### Sample Menu
```text
========================================================
      TOWER OF HANOI - 2ND YEAR DSA C++ COMPANION       
========================================================
1. Run Recursive Solution (Standard Syllabus)
2. Run Iterative Stack Solution (OS Call Stack Emulation)
3. View Bitwise Pattern & Complexity Analysis
4. Exit
Enter your choice (1-4): 1
Enter number of disks (n, recommended 1 to 5): 3

For n = 3 disks, optimal number of moves = 2^3 - 1 = 7
--------------------------------------------------------
Step   1: Move disk 1 from [A] -> [C]
Step   2: Move disk 2 from [A] -> [B]
Step   3: Move disk 1 from [C] -> [B]
Step   4: Move disk 3 from [A] -> [C]
Step   5: Move disk 1 from [B] -> [A]
Step   6: Move disk 2 from [B] -> [C]
Step   7: Move disk 1 from [A] -> [C]
--------------------------------------------------------
Completed successfully in 7 moves!
```

---

## 📖 Quick Study Cheat Sheet for University Exams

### 1. The Rules
1. Only **one disk** can be moved at a time.
2. Only the **top disk** of any rod can be removed.
3. A **larger disk can never be placed on top of a smaller disk**.

---

### 2. The Recursive Algorithm
```cpp
void towerOfHanoi(int n, char from_rod, char to_rod, char aux_rod) {
    if (n == 1) {
        cout << "Move disk 1 from " << from_rod << " to " << to_rod << endl;
        return;
    }
    // Step 1: Move top (n - 1) disks from Source to Auxiliary
    towerOfHanoi(n - 1, from_rod, aux_rod, to_rod);

    // Step 2: Move n-th disk from Source to Destination
    cout << "Move disk " << n << " from " << from_rod << " to " << to_rod << endl;

    // Step 3: Move (n - 1) disks from Auxiliary to Destination
    towerOfHanoi(n - 1, aux_rod, to_rod, from_rod);
}
```

---

### 3. Tracing Table for $n = 3$ Disks
Initial State: Rod A = `[3, 2, 1]`, Rod B = `[]`, Rod C = `[]` (Goal: transfer to Rod C)

| Step | Disk Moved | From Rod | To Rod | State after move |
| :---: | :---: | :---: | :---: | :--- |
| **1** | Disk 1 | A | C | A: `[3, 2]`, B: `[]`, C: `[1]` |
| **2** | Disk 2 | A | B | A: `[3]`, B: `[2]`, C: `[1]` |
| **3** | Disk 1 | C | B | A: `[3]`, B: `[2, 1]`, C: `[]` |
| **4** | Disk 3 | A | C | A: `[]`, B: `[2, 1]`, C: `[3]` |
| **5** | Disk 1 | B | A | A: `[1]`, B: `[2]`, C: `[3]` |
| **6** | Disk 2 | B | C | A: `[1]`, B: `[]`, C: `[3, 2]` |
| **7** | Disk 1 | A | C | A: `[]`, B: `[]`, C: `[3, 2, 1]` |

Total moves: $2^3 - 1 = 7$.

---

### 4. Mathematical Complexity Summary

| Metric | Value | Reason |
| :--- | :---: | :--- |
| **Recurrence Relation** | $T(n) = 2T(n-1) + 1$ | 2 subproblems of size $n-1$, plus 1 disk move |
| **Base Condition** | $T(1) = 1$ | 1 disk requires 1 direct move |
| **Total Moves** | $2^n - 1$ | Sum of geometric series: $\sum_{i=0}^{n-1} 2^i$ |
| **Time Complexity** | $\mathbf{\Theta(2^n)}$ or $\mathbf{O(2^n)}$ | Exponential time growth |
| **Space Complexity** | $\mathbf{O(n)}$ | Maximum depth of call stack is $n$ |
| **Total Function Invocations** | $2^{n+1} - 1$ | Total nodes in the complete binary recursion tree |

---

## 📁 File Structure
```
tower of hanoi/
├── index.html        # Main interactive web application (HTML5)
├── style.css         # Modern, responsive styling with Dark/Light mode
├── app.js            # Core interactive visualizer engine, call stack, tree, & quiz
├── hanoi.cpp         # Complete C++ code (Recursive, Iterative, Bitwise)
├── hanoi.exe         # Compiled C++ executable
└── README.md         # Comprehensive documentation & exam study guide
```

---
*Happy Learning! Master your DSA concepts with intuition and practice.*
