import os

# Get the current directory
current_dir = os.getcwd()

# Get the list of files in the current directory
files = os.listdir(current_dir)

# Remove the script file from the list
script_file = os.path.basename(__file__)
files.remove(script_file)

# Create a report file
report_file = "file_report.txt"

# Write the names of the files to the report file
with open(report_file, "w", encoding="utf-8") as f:
    for file in files:
        f.write(file + "\n")

print("File report generated successfully.")