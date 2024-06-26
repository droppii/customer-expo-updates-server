while getopts d: flag
do
    case "${flag}" in
        d) directory=${OPTARG};;
    esac
done

if [ ! -d "updates/$directory" ]; 
then
    echo "Creating directory..."
    mkdir -p "updates/$directory"
    continue
fi

cd ../customer-mobile
npx expo export
cd ../customer-expo-updates-server
rm -rf updates/$directory/
cp -r ../customer-mobile/dist/ updates/$directory

node ./scripts/exportClientExpoConfig.js > updates/$directory/expoConfig.json
exit 0