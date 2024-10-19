from parsing import parseBinaryTest, parseBinary


# # MATH 3134 -> Simple and group
# # MATH 1226 and (MATH 2534 or MATH 3034)
# breakpoint()
assert(parseBinaryTest("MATH 1226 and (MATH 2534 or MATH 3034)") == (0, ["MATH-1226", (1,["MATH-2534", "MATH-3034"])]))

# # CS 3214 -> simple or group
# # (CS 2506 and CS 2114) or (ECE 2564 and ECE 3574)
assert(parseBinaryTest("(CS 2506 and CS 2114) or (ECE 2564 and ECE 3574)") == (1, [(0,["CS-2506", "CS-2114"]), (0,["ECE-2564", "ECE-3574"])]))


# # ISE 3414 -> More complicated and group
# # ISE 2004 and ISE 2024 and (MATH 2204 or MATH 2204H or MATH 2406H) and (MATH 2214 or MATH 2214H) and (CS 1044 or CS 1064 or CS 1114 or ECE 1574)
assert(parseBinaryTest("ISE 2004 and ISE 2024 and (MATH 2204 or MATH 2204H or MATH 2406H) and (MATH 2214 or MATH 2214H) and (CS 1044 or CS 1064 or CS 1114 or ECE 1574)") == (0, ["ISE-2004", "ISE-2024",(1,["MATH-2204","MATH-2204H","MATH-2406H"]),(1,["MATH-2214","MATH-2214H"]), (1,["CS-1044","CS-1064","CS-1114","ECE-1574"])]))


# # CS 4824 -> simple and group
# # (ECE 3514 or CS 2114) and (STAT 3704 or STAT 4105 or STAT 4604 or STAT 4705 or STAT 4714 or CMDA 2006)
assert(parseBinaryTest("(ECE 3514 or CS 2114) and (STAT 3704 or STAT 4105 or STAT 4604 or STAT 4705 or STAT 4714 or CMDA 2006)") == (0,[(1,["ECE-3514","CS-2114"]),(1,["STAT-3704","STAT-4105","STAT-4604","STAT-4705","STAT-4714","CMDA-2006"])]))

# MATH 3414 -> what the fuck is this

# (CS 1044 or CS 1705 or CS 1114 or CS 1124) 
# and
# MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) 
# and 
# (MATH 2204 or MATH 2204H)
#
# print(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and (MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H)) and (MATH 2204 or MATH 2204H)"))
# print("")

# "PHYS 2305 or PHYS 2205 and PHYS 2215"
# breakpoint()
assert(parseBinaryTest("PHYS 2305 or PHYS 2205 and PHYS 2215") == (1,["PHYS-2305",(0,["PHYS-2205", "PHYS-2215"])]))




# "BC 2024 and (PHYS 2305 or PHYS 2205 and PHYS 2215) or (CEM 2104 and PHYS 2305)"
#  ['(', 'BC2024', 'and', '(', 'PHYS2305', 'or', '(', 'PHYS2205', 'and', 'PHYS2215', '(', ')', ')', 'or', '(', 'CEM2104', 'and', ')', 'PHYS2305', ')', ')']
# breakpoint()
print(parseBinaryTest("BC 2024 and (PHYS 2305 or PHYS 2205 and PHYS 2215) or (CEM 2104 and PHYS 2305)"))
                                                                                                         #  (0, ['BC2024', (1, ['PHYS2305', (0, ['PHYS2205', 'PHYS2215', (None, [])]), (0, ['CEM2104']), 'PHYS2305'])])
assert(parseBinaryTest("BC 2024 and (PHYS 2305 or PHYS 2205 and PHYS 2215) or (CEM 2104 and PHYS 2305)") == (0, ["BC-2024", (1, [(1,["PHYS-2305", (0,["PHYS-2205","PHYS-2215"])]), (0,["CEM-2104", "PHYS-2305"])])]))
# print(parseBinary("(BIOL 1005 and BIOL 1006) or (BIOL 1105 or (BIOL 1205H and BIOL 1206H)"))
assert(parseBinaryTest("(BIOL 1005 and BIOL 1006) or (BIOL 1105 or (BIOL 1205H and BIOL 1206H)") == (1, [(0, ["BIOL-1005", "BIOL-1006"]), (1,["BIOL-1105", (0,["BIOL-1205H", "BIOL-1206H"])])]))


assert(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and (MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H)) and (MATH 2204 or MATH 2204H)") == (0,[(1,["CS-1044","CS-1705","CS-1114","CS-1124"]),(1,["MATH-2406H",(0,["CMDA-2005","CMDA-2006"]),(1,["MATH-2214","MATH-2214H"])]),(1,["MATH-2204","MATH-2204H"])]))
# print(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) and (MATH 2204 or MATH 2204H)"))

# breakpoint()
assert(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) and (MATH 2204 or MATH 2204H)") == (0,[(1,["CS-1044","CS-1705","CS-1114","CS-1124"]),(1,["MATH-2406H",(0,["CMDA-2005","CMDA-2006"]),(1,["MATH-2214","MATH-2214H"])]),(1,["MATH-2204","MATH-2204H"])]))


# print(parseBinary("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) and (MATH 2204 or MATH 2204H)"))
# print(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) and (MATH 2204 or MATH 2204H)"))

# print(parseBinaryTest("CSES 3114 or ENSC 3114 or GEOS 3614 and CSES 3124 or ENSC 3124 or GEOS 3624 and CHEM 2514 or CHEM 2535 and CHEM 2114 and (MATH 1026 or MATH 1226)"))

print(parseBinaryTest("(ME 3024 and ME 3034 and ME 3304 and ME 3524 and ME 3534 and ME 3624 and ME 4005 and MSE 2034) or (MSE 4644 and MSE 3044 and MSE 3054 and MSE 3884 and MSE 4414 and MSE 4554) or (MSE 4644 and MSE 3044 and MSE 3054 and MSE 3884 and MSE 4414 and MSE 3304) or (MSE 4644 and MSE 3044 and MSE 3054 and MSE 3884 and MSE 4414 and MSE 3204) or (MSE 4644 and MSE 3044 and MSE 3054 and MSE 3884 and MSE 4554 and MSE 3304) or (MSE 4644 and MSE 3044 and MSE 3054 and MSE 3884 and MSE 4554 and MSE 3204) or (MSE 4644 and MSE 3044 and MSE 3054 and MSE 3884 and MSE 3304 and MSE 3204) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3106) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3106) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3134) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3134) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3204) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3204) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3214) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3214) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3304) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3304) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3544) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3544) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3564) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3564) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3574) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3574) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3614) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3614) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 3704) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 3704) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 4205) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 4205) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 4234) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 4234) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 4354) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 4354) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 4424) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 4424) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 4524) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 4524) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 4540) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 4540) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 4580) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 4580) or (ECE 2804 and ECE 3004 and ECE 3105 and ECE 4704) or (ECE 2804 and ECE 3004 and ECE 3514 and ECE 4704) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3106) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3106) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3134) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3134) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3204) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3204) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3214) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3214) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3304) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3304) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3544) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3544) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3564) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3564) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3574) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3574) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3614) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3614) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 3704) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 3704) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 4205) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 4205) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 4234) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 4234) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 4354) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 4354) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 4424) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 4424) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 4524) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 4524) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 4540) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 4540) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 4580) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 4580) or (ECE 2804 and ECE 3504 and ECE 3105 and ECE 4704) or (ECE 2804 and ECE 3504 and ECE 3514 and ECE 4704) or (BMES 3034 and BMES 3184) or (ISE 2034 and ISE 2214 and ISE 3034 and ISE 3214 and ISE 3424 and ISE 3624 and ISE 4204)"))