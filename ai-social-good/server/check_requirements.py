import pkg_resources

required_packages = {
    'tensorflow': '2.15.0',
    'flask': '2.0.1',
    'flask-cors': '3.0.10',
    'numpy': '1.24.0',
    'pandas': '2.0.0',
    'scikit-learn': '1.3.0',
    'python-dotenv': '1.0.0',
    'firebase-admin': '6.2.0',
    'pillow': '10.0.0',
    'transformers': '4.35.0',
    'torch': '2.1.0',
    'openai': '1.3.0',
    'twilio': '8.10.0',
    'geopandas': '0.14.0',
    'psycopg2-binary': '2.9.9',
    'joblib': '1.3.2',
    'whisper': '1.1.10'
}

print("Checking installed packages...\n")

for package, required_version in required_packages.items():
    try:
        installed_version = pkg_resources.get_distribution(package).version
        print(f"{package}:")
        print(f"  Required: {required_version}")
        print(f"  Installed: {installed_version}")
        if pkg_resources.parse_version(installed_version) >= pkg_resources.parse_version(required_version):
            print("  ✓ Version requirement satisfied")
        else:
            print("  ✗ Version requirement NOT satisfied")
        print()
    except pkg_resources.DistributionNotFound:
        print(f"{package}:")
        print("  ✗ Package not installed")
        print() 