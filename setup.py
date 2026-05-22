from setuptools import setup, find_packages

# Read requirements.txt
def get_requirements(file_path="requirements.txt"):
    with open(file_path) as f:
        requirements = f.readlines()

    # remove newline characters
    requirements = [req.strip() for req in requirements]

    # remove empty lines
    requirements = [req for req in requirements if req]

    return requirements


setup(
    name="study_assistant",
    version="1.1.0",
    author="AjithNadagani",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=get_requirements(),
    python_requires=">=3.8",
)

