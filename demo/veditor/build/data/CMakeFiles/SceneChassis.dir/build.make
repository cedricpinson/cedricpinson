# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 2.8

#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canoncical targets will work.
.SUFFIXES:

# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list

# Suppress display of executed commands.
$(VERBOSE).SILENT:

# A target that is always out of date.
cmake_force:
.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E remove -f

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /var/www/vehicleEditor

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /var/www/vehicleEditor/build

# Utility rule file for SceneChassis.

data/CMakeFiles/SceneChassis: data/chassis/chassis.osg

data/chassis/chassis.osg: ../data/template.blend
	$(CMAKE_COMMAND) -E cmake_progress_report /var/www/vehicleEditor/build/CMakeFiles $(CMAKE_PROGRESS_1)
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --blue --bold "Generating chassis/chassis.osg"
	cd /var/www/vehicleEditor/blenderExporter && cmake -E copy_if_different /var/www/vehicleEditor/data/template.blend /var/www/vehicleEditor/build/data/chassis/template.blend
	cd /var/www/vehicleEditor/blenderExporter && /usr/bin/blender -b /var/www/vehicleEditor/build/data/chassis/template.blend -P vehicleeditorExport.py --vehicleeditor="what=Chassis;path=/var/www/vehicleEditor/build/data/"

SceneChassis: data/CMakeFiles/SceneChassis
SceneChassis: data/chassis/chassis.osg
SceneChassis: data/CMakeFiles/SceneChassis.dir/build.make
.PHONY : SceneChassis

# Rule to build all files generated by this target.
data/CMakeFiles/SceneChassis.dir/build: SceneChassis
.PHONY : data/CMakeFiles/SceneChassis.dir/build

data/CMakeFiles/SceneChassis.dir/clean:
	cd /var/www/vehicleEditor/build/data && $(CMAKE_COMMAND) -P CMakeFiles/SceneChassis.dir/cmake_clean.cmake
.PHONY : data/CMakeFiles/SceneChassis.dir/clean

data/CMakeFiles/SceneChassis.dir/depend:
	cd /var/www/vehicleEditor/build && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /var/www/vehicleEditor /var/www/vehicleEditor/data /var/www/vehicleEditor/build /var/www/vehicleEditor/build/data /var/www/vehicleEditor/build/data/CMakeFiles/SceneChassis.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : data/CMakeFiles/SceneChassis.dir/depend
