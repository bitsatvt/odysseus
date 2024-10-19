from sympy import symbols, Or, And, to_cnf

# Define the course codes as SymPy symbols
MATH_2214, MATH_2214H, MATH_2204, MATH_2204H, MATH_2406H = symbols(
    "MATH_2214 MATH_2214H MATH_2204 MATH_2204H MATH_2406H"
)
PHYS_2305, PHYS_2306, PHYS_2504 = symbols("PHYS_2305 PHYS_2306 PHYS_2504")

# Construct the SymPy logical expression
expr = Or(
    And(MATH_2214, MATH_2204, PHYS_2305, PHYS_2306, PHYS_2504),
    And(MATH_2214H, MATH_2204, PHYS_2305, PHYS_2306, PHYS_2504),
    And(MATH_2214, MATH_2204H, PHYS_2305, PHYS_2306, PHYS_2504),
    And(MATH_2214H, MATH_2204H, PHYS_2305, PHYS_2306, PHYS_2504),
    And(MATH_2406H, PHYS_2305, PHYS_2306, PHYS_2504),
)

simplified_expr = to_cnf(expr, simplify=True, force=True)
# Output the final expression and course symbol mapping
print(expr, "\n")
print(simplified_expr)
