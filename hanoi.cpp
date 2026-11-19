/**
 * ============================================================================
 * Topic: Tower of Hanoi in C++
 * Course: Data Structures and Algorithms (Semester 3 / 2nd Year B.Tech/BCA/CS)
 * ============================================================================
 * 
 * Rules of Tower of Hanoi:
 * 1. Only one disk can be moved at a time.
 * 2. Each move consists of taking the upper disk from one of the stacks and
 *    placing it on top of another stack or on an empty rod.
 * 3. No larger disk may be placed on top of a smaller disk.
 *
 * Mathematical Complexity:
 * - Recurrence Relation: T(n) = 2*T(n-1) + 1, with T(1) = 1
 * - Total Moves Required: 2^n - 1
 * - Time Complexity:  O(2^n)
 * - Space Complexity: O(n) (Maximum depth of the recursion call stack)
 * - Total Function Calls: 2^(n+1) - 1 (including base cases)
 * ============================================================================
 */

#include <iostream>
#include <vector>
#include <stack>
#include <cmath>
#include <iomanip>
#include <string>

using namespace std;

// Global counter to track moves
long long moveCount = 0;

/**
 * ----------------------------------------------------------------------------
 * Approach 1: Classic Recursive Solution (Standard Syllabus Implementation)
 * ----------------------------------------------------------------------------
 * Parameters:
 * @param n: Number of disks to move
 * @param from_rod: The rod currently holding the disks (Source)
 * @param to_rod:   The rod where disks should go (Destination)
 * @param aux_rod:  The helper rod (Auxiliary)
 */
void towerOfHanoiRecursive(int n, char from_rod, char to_rod, char aux_rod) {
    // BASE CASE:
    // If there is only 1 disk, move it directly from source to destination.
    if (n == 1) {
        moveCount++;
        cout << "Step " << setw(3) << moveCount << ": Move disk 1 from [" 
             << from_rod << "] -> [" << to_rod << "]" << endl;
        return;
    }

    // RECURSIVE STEP 1:
    // Move the top (n - 1) disks from Source rod to Auxiliary rod,
    // using the Destination rod as a temporary helper.
    towerOfHanoiRecursive(n - 1, from_rod, aux_rod, to_rod);

    // RECURSIVE STEP 2:
    // Move the largest (n-th) disk directly from Source rod to Destination rod.
    moveCount++;
    cout << "Step " << setw(3) << moveCount << ": Move disk " << n << " from [" 
         << from_rod << "] -> [" << to_rod << "]" << endl;

    // RECURSIVE STEP 3:
    // Move the (n - 1) disks from Auxiliary rod to Destination rod,
    // using the Source rod as a temporary helper.
    towerOfHanoiRecursive(n - 1, aux_rod, to_rod, from_rod);
}


/**
 * ----------------------------------------------------------------------------
 * Approach 2: Iterative Solution using an Explicit Call Stack
 * (Helps understand how the Operating System executes recursion internally)
 * ----------------------------------------------------------------------------
 */
struct StackFrame {
    int n;
    char from_rod;
    char to_rod;
    char aux_rod;
    int stage; // 0: before call 1, 1: before print, 2: before call 2
};

void towerOfHanoiExplicitStack(int n, char from_rod, char to_rod, char aux_rod) {
    stack<StackFrame> callStack;
    callStack.push({n, from_rod, to_rod, aux_rod, 0});
    long long iterMoves = 0;

    while (!callStack.empty()) {
        StackFrame &curr = callStack.top();

        if (curr.n == 1) {
            iterMoves++;
            cout << "Step " << setw(3) << iterMoves << ": Move disk 1 from [" 
                 << curr.from_rod << "] -> [" << curr.to_rod << "]" << endl;
            callStack.pop();
            continue;
        }

        if (curr.stage == 0) {
            // Stage 0: Simulate first recursive call: towerOfHanoi(n-1, from, aux, to)
            curr.stage = 1;
            callStack.push({curr.n - 1, curr.from_rod, curr.aux_rod, curr.to_rod, 0});
        } 
        else if (curr.stage == 1) {
            // Stage 1: Move disk n
            iterMoves++;
            cout << "Step " << setw(3) << iterMoves << ": Move disk " << curr.n 
                 << " from [" << curr.from_rod << "] -> [" << curr.to_rod << "]" << endl;
            curr.stage = 2;
            // Stage 2: Simulate second recursive call: towerOfHanoi(n-1, aux, to, from)
            callStack.push({curr.n - 1, curr.aux_rod, curr.to_rod, curr.from_rod, 0});
        } 
        else {
            // Both subproblems completed, pop this frame
            callStack.pop();
        }
    }
}


/**
 * ----------------------------------------------------------------------------
 * Approach 3: Binary / Bitwise Formula (Interview Special)
 * Notice that:
 * - Disk moved at step k is determined by the position of the lowest set bit in k:
 *   disk = 1 + count_trailing_zeros(k)
 * - Direction of movement is cyclical depending on whether n is even or odd!
 * ----------------------------------------------------------------------------
 */
void explainBitwiseInsight(int n) {
    cout << "\n=======================================================\n";
    cout << "  BITWISE & BINARY PERSPECTIVE (Interview Favorite)\n";
    cout << "=======================================================\n";
    cout << "Total moves needed = 2^" << n << " - 1 = " << ((1LL << n) - 1) << "\n\n";
    cout << "Step (k) | Binary of k | Lowest Set Bit | Disk Moved\n";
    cout << "---------+-------------+----------------+-----------\n";
    
    int limit = min((1 << n) - 1, 15); // Show first 15 moves as sample
    for (int k = 1; k <= limit; k++) {
        // Find position of lowest set bit (1-indexed)
        int lowestBit = __builtin_ffs(k); // gcc built-in for 1-based index of first set bit
        
        // Print binary representation (4 bits)
        string binary = "";
        for (int b = 3; b >= 0; b--) {
            binary += ((k >> b) & 1) ? '1' : '0';
        }

        cout << setw(8) << k << " | "
             << setw(11) << binary << " | "
             << setw(14) << lowestBit << " | Disk " << lowestBit << "\n";
    }
    if ((1 << n) - 1 > 15) {
        cout << "  ... (continues up to " << ((1LL << n) - 1) << " moves)\n";
    }
    cout << "Observation: Disk 1 moves on every odd step (k % 2 != 0)!\n";
    cout << "=======================================================\n\n";
}


/**
 * ----------------------------------------------------------------------------
 * Main Function - Interactive Terminal Menu
 * ----------------------------------------------------------------------------
 */
int main() {
    int choice;
    int n;

    cout << "========================================================\n";
    cout << "      TOWER OF HANOI - 2ND YEAR DSA C++ COMPANION       \n";
    cout << "========================================================\n";
    cout << "1. Run Recursive Solution (Standard Syllabus)\n";
    cout << "2. Run Iterative Stack Solution (OS Call Stack Emulation)\n";
    cout << "3. View Bitwise Pattern & Complexity Analysis\n";
    cout << "4. Exit\n";
    cout << "Enter your choice (1-4): ";
    
    if (!(cin >> choice)) {
        cout << "Invalid input. Exiting.\n";
        return 0;
    }

    if (choice == 1 || choice == 2) {
        cout << "Enter number of disks (n, recommended 1 to 5): ";
        cin >> n;

        if (n <= 0) {
            cout << "Number of disks must be at least 1!\n";
            return 0;
        }

        long long totalMoves = (1LL << n) - 1;
        cout << "\nFor n = " << n << " disks, optimal number of moves = 2^" 
             << n << " - 1 = " << totalMoves << endl;
        cout << "--------------------------------------------------------\n";

        if (choice == 1) {
            moveCount = 0;
            towerOfHanoiRecursive(n, 'A', 'C', 'B');
            cout << "--------------------------------------------------------\n";
            cout << "Completed successfully in " << moveCount << " moves!\n";
        } else {
            towerOfHanoiExplicitStack(n, 'A', 'C', 'B');
            cout << "--------------------------------------------------------\n";
            cout << "Completed successfully via explicit stack!\n";
        }
    } 
    else if (choice == 3) {
        cout << "Enter n (e.g. 3 or 4): ";
        cin >> n;
        explainBitwiseInsight(n);
    }
    else {
        cout << "Exiting. Happy Coding!\n";
    }

    return 0;
}
