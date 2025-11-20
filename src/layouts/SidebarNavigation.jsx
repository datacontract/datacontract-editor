import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useEditorStore} from "../store.js";
import {useMemo} from 'react';
import * as YAML from 'yaml';
import serverIcons from '../assets/server-icons/serverIcons.jsx';

const SidebarNavigation = () => {
    const yaml = useEditorStore((state) => state.yaml);
    const setYaml = useEditorStore((state) => state.setYaml);
    const setView = useEditorStore((state) => state.setView);
    const currentView = useEditorStore((state) => state.currentView);
    const location = useLocation();
    const navigate = useNavigate();

    // Parse schemas from YAML
    const schemas = useMemo(() => {
        if (!yaml?.trim()) {
            return [];
        }
        try {
            const parsed = YAML.parse(yaml);
            return parsed.schema || [];
        } catch {
            return [];
        }
    }, [yaml]);

    // Parse servers from YAML
    const servers = useMemo(() => {
        if (!yaml?.trim()) {
            return [];
        }
        try {
            const parsed = YAML.parse(yaml);
            return parsed.servers || [];
        } catch {
            return [];
        }
    }, [yaml]);

    // Get colored icon for server type
  const getServerTypeIcon = (type) => {
    if (!type) {
            return serverIcons.custom();
        }

        const IconComponent = serverIcons[type];
    if (IconComponent) {
      return <IconComponent />;
    }

    // Default to custom icon if type not found
    return serverIcons.custom();
    };

    // Add a new schema
    const addSchema = () => {
        try {
            let parsed = {};
            if (yaml?.trim()) {
                try {
                    parsed = YAML.parse(yaml) || {};
                } catch {
                    parsed = {};
                }
            }

            if (!parsed.schema) {
                parsed.schema = [];
            }

            // Add new empty schema
            parsed.schema.push({
                name: '',
                description: '',
                type: 'object',
                properties: []
            });

            const newYaml = YAML.stringify(parsed);
            setYaml(newYaml);

            // Navigate to the new schema
            navigate(`/schemas/${parsed.schema.length - 1}`);
        } catch (error) {
            console.error('Error adding schema:', error);
        }
    };

    const handleNavigationClick = (e, item) => {
        e.preventDefault();

        switch (currentView) {
            case 'form':
                // Navigate to the form
                navigate(item.path);
                break;
            case 'yaml':
                // For YAML view, try to find and scroll to the section
                try {
                    const yamlPropertyName = item.yamlProperty;
                    if (yamlPropertyName) {
                        // Look for the property in YAML (handles both top-level and nested)
                        const propertyPattern = new RegExp(`^\\s*${yamlPropertyName}:\\s*`, 'm');
                        const match = yaml.match(propertyPattern);
                        if (match) {
                            const lineNumber = yaml.substring(0, match.index).split('\n').length;
                            // Store the line number in navigation state
                            navigate('/yaml', {state: {scrollToLine: lineNumber}});
                        } else {
                            // If not found in YAML, stay in YAML view (don't switch to form)
                            // Just ensure we're on the /yaml route
                            if (location.pathname !== '/yaml') {
                                navigate('/yaml');
                            }
                        }
                    } else {
                        // No YAML property, stay in YAML view
                        if (location.pathname !== '/yaml') {
                            navigate('/yaml');
                        }
                    }
                } catch (error) {
                    console.error('Error finding section in YAML:', error);
                    // Stay in YAML view even on error
                    if (location.pathname !== '/yaml') {
                        navigate('/yaml');
                    }
                }
                break;
            case 'diagram':
                // Switch to form view
                setView('form');
                navigate(item.path);
                break;
            default:
                // Default to form view
                setView('form');
                navigate(item.path);
                break;
        }
    };

    const navigationItems = [
        {
            id: 'overview',
            title: 'Fundamentals',
            path: '/overview',
            yamlProperty: 'info',
            icon: (
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M3.620424 5.160096C2.885376 5.231184000000001 2.351352 5.695224 2.158848 6.4301759999999994C2.113056 6.605016 2.112 6.730295999999999 2.112 12.012672C2.112 17.321952000000003 2.11284 17.41956 2.159592 17.602368000000002C2.3148 18.209256 2.74452 18.62676 3.391848 18.799632L3.588 18.852 12.012 18.852L20.436 18.852 20.64 18.798047999999998C21.257208 18.634848 21.672816 18.212471999999998 21.83844 17.580144C21.887808 17.391696 21.888 17.370264 21.888 11.987328C21.888 6.678048 21.88716 6.58044 21.840408 6.397632C21.686664 5.796456 21.267623999999998 5.385192 20.620872 5.200728L20.436 5.148 12.120000000000001 5.145168C7.546200000000001 5.143608 3.721392 5.150328 3.620424 5.160096M3.66372 6.715896000000001C3.627024 6.756456 3.624 7.1578800000000005 3.624 12.004176C3.624 17.054376 3.6256320000000004 17.250024 3.6678960000000003 17.28828C3.708552 17.325072000000002 4.321704 17.328 12.004176 17.328C20.007216 17.328 20.297952000000002 17.326464 20.336280000000002 17.284104000000003C20.372976 17.243544 20.376 16.84212 20.376 11.995824C20.376 6.9456240000000005 20.374368 6.749976000000001 20.332104 6.71172C20.291448 6.674928 19.678296 6.672 11.995824 6.672C3.9927840000000003 6.672 3.7020480000000004 6.673536 3.66372 6.715896000000001M5.657616 8.449848C5.419344000000001 8.506704000000001 5.194368 8.701368 5.11176 8.922144C5.063904 9.05004 5.063232 9.092016000000001 5.069568 11.56404L5.0760000000000005 14.076 5.131512 14.188680000000002C5.206608 14.341152000000001 5.360472000000001 14.49048 5.5200000000000005 14.565743999999999L5.652 14.628 8.16 14.628L10.668000000000001 14.628 10.805280000000002 14.563656C10.985088 14.479368000000001 11.143632 14.314512 11.206536000000002 14.146392C11.255328 14.016024 11.256 13.979928 11.256 11.532C11.256 9.084071999999999 11.255328 9.047976 11.206536000000002 8.917608C11.143632 8.749488000000001 10.985088 8.584632 10.805280000000002 8.500344L10.668000000000001 8.436 8.208 8.432136C6.8206560000000005 8.429952 5.708592 8.43768 5.657616 8.449848M6.5760000000000005 11.532L6.5760000000000005 13.128 8.16 13.128L9.744 13.128 9.744 11.532L9.744 9.936 8.16 9.936L6.5760000000000005 9.936 6.5760000000000005 11.532M13.182408000000002 10.321296C13.027536 10.351872 12.910944 10.415664 12.791304 10.535304C12.414768 10.911840000000002 12.518256000000001 11.5026 13.002504 11.740992L13.162968 11.82 15.635496000000002 11.82C18.360623999999998 11.82 18.234336 11.826864 18.446376 11.66724C18.608976000000002 11.54484 18.707424 11.3898 18.743304000000002 11.199696C18.790296 10.950624000000001 18.732552000000002 10.749744 18.558648 10.55724C18.442728 10.428912 18.305832000000002 10.35312 18.133584000000003 10.321848000000001C17.96232 10.290768 13.339751999999999 10.290264 13.182408000000002 10.321296M13.072752 13.162656C12.575208 13.340112 12.403991999999999 13.972056 12.747672000000001 14.362464000000001C12.872208 14.503944 13.007784 14.581728 13.186416 14.614152C13.389384 14.650992 17.974584 14.649984000000002 18.148824 14.613048C18.321024 14.576544 18.424992 14.519568 18.544848 14.395992C18.735792 14.19912 18.80328 13.912824 18.7236 13.637640000000001C18.678168 13.480775999999999 18.514152 13.296959999999999 18.338472 13.206L18.187800000000003 13.128 15.675912 13.129056C13.624416 13.129920000000002 13.147272000000001 13.136064000000001 13.072752 13.162656" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} /></svg>
            ),
            completed: true
        },
        {
            id: 'terms-of-use',
            title: 'Terms of Use',
            path: '/terms-of-use',
            yamlProperty: 'description',
            icon: (
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M11.1 0.97236C9.825048 1.080432 8.624472 1.386168 7.503456 1.8882240000000001C4.14168 3.393792 1.7481119999999999 6.4502880000000005 1.1071920000000002 10.056000000000001C0.7290960000000001 12.183168 0.9788640000000001 14.367528000000002 1.8269520000000001 16.350816000000002C2.556744 18.057432000000002 3.708552 19.554576 5.184 20.7144C7.964904 22.900392 11.659512 23.615208 15.080928 22.629168C16.051224 22.349544 17.041464 21.903336 17.916 21.351648C18.946512 20.701584 19.938959999999998 19.802328 20.714376 18.816C23.198591999999998 15.656112 23.759808 11.359824000000001 22.173047999999998 7.649184C21.443256 5.9425680000000005 20.291448 4.445424 18.816 3.2856C17.280408 2.078496 15.427224 1.296456 13.476 1.0321200000000001C12.783024 0.9382560000000001 11.795352000000001 0.913392 11.1 0.97236M11.34 2.4621839999999997C10.861392 2.508072 10.668816 2.5320240000000003 10.368864 2.583024C9.150960000000001 2.790144 7.992336000000001 3.2342880000000003 6.912 3.9081840000000003C5.73672 4.641312 4.641312 5.73672 3.9081840000000003 6.912C3.1424640000000004 8.139528 2.704464 9.377952 2.503344 10.884C2.444208 11.326944000000001 2.4444 12.668327999999999 2.503704 13.116C2.70192 14.61276 3.145152 15.8664 3.9080160000000004 17.088C4.64304 18.265008 5.73588 19.357824 6.912 20.091912C8.13456 20.854968 9.388632 21.298368 10.884 21.496272C11.341608 21.556848 12.648336 21.556464000000002 13.116 21.495624C14.595528000000002 21.303192000000003 15.869232 20.853096 17.088 20.091984C18.262944 19.358256 19.358256 18.262944 20.091984 17.088C20.853144 15.86916 21.303816 14.593776 21.495528 13.116C21.557832 12.635784 21.557832 11.364216 21.495528 10.884C21.391464000000003 10.081968 21.238992 9.442295999999999 20.983848000000002 8.737416000000001C20.036304 6.119616000000001 17.964408000000002 4.027152 15.352104 3.049728C14.620368000000001 2.775936 13.952952000000002 2.612856 13.128 2.50632C12.844704 2.4697440000000004 11.585424 2.43864 11.34 2.4621839999999997M11.230056 6.667992000000001C10.372296 6.8919120000000005 10.084584 7.974792000000001 10.714872 8.606904C11.176728 9.07008 11.886672 9.069768 12.350232 8.606232C12.813768000000001 8.142672000000001 12.814079999999999 7.432728 12.350904 6.970872C12.047424 6.668280000000001 11.645280000000001 6.559608 11.230056 6.667992000000001M10.092 9.2484C9.876168 9.319296 9.725688 9.446904 9.620712000000001 9.648C9.539856 9.80292 9.539064 10.140504 9.619200000000001 10.291080000000001C9.70368 10.449768 9.830832000000001 10.57596 9.980136 10.649280000000001C10.11324 10.714656000000002 10.126728 10.71624 10.644 10.728L11.172 10.74 11.17812 13.264008L11.184216000000001 15.788015999999999 10.65012 15.796128000000001C10.16568 15.803496 10.10568 15.809016 10.005072 15.855408000000002C9.852912 15.925608 9.704736 16.065264 9.628368 16.210488C9.57288 16.315968 9.564432 16.360488 9.564432 16.548000000000002C9.564432 16.735512 9.57288 16.780032000000002 9.628368 16.885512C9.704688 17.030640000000002 9.852792 17.170296 10.005072 17.240712000000002C10.115400000000001 17.291712 10.126248 17.292 12 17.292C13.873752 17.292 13.884599999999999 17.291712 13.994928 17.240712000000002C14.147208 17.170296 14.295312000000001 17.030640000000002 14.371632 16.885512C14.42712 16.780032000000002 14.435568 16.735512 14.435568 16.548000000000002C14.435568 16.360488 14.42712 16.315968 14.371632 16.210488C14.295312000000001 16.06536 14.147208 15.925704000000001 13.994928 15.855288C13.892832000000002 15.808079999999999 13.836672 15.803376000000002 13.290000000000001 15.796152000000001L12.696 15.788304 12.695592 13.204152C12.695231999999999 11.028504 12.689616000000001 10.593432 12.660024 10.452C12.54864 9.919704000000001 12.110808 9.4476 11.568 9.274536000000001C11.39208 9.218448 10.245000000000001 9.198144 10.092 9.2484" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth={0.024} /></svg>            )
        },
        {
            id: 'schemas',
            title: 'Schemas',
            path: '/schemas',
            yamlProperty: 'schema',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" version="1.1">
                    <path
                        d="M7.836 1.975776C7.6277040000000005 2.05776 7.471176 2.204016 7.38516 2.397072C7.315295999999999 2.553912 7.317264000000001 2.82444 7.3895040000000005 2.9903760000000004C7.451544 3.132864 7.598592 3.284424 7.752 3.363984L7.86 3.42 14.873448 3.432L21.88692 3.444 21.953448 3.510552L22.02 3.5770799999999996 22.032 10.098552000000002L22.044 16.62 22.107936 16.740000000000002C22.190231999999998 16.894488 22.324848 17.023392 22.476 17.092464C22.646808 17.170488000000002 22.93428 17.170512 23.092632000000002 17.092512C23.249304000000002 17.015352 23.393256 16.86792 23.468376000000003 16.70772L23.532 16.572 23.538936 10.152000000000001C23.543496 5.929416 23.53752 3.6534240000000002 23.521512 3.502416C23.476536 3.0783599999999995 23.351448 2.799768 23.068584 2.493672C22.87584 2.285088 22.633608000000002 2.12412 22.370832 2.03004L22.164 1.956 15.036 1.9517280000000001C9.605256 1.9484640000000002 7.8908640000000005 1.9542 7.836 1.975776M4.944 4.89444C4.743696 4.955592 4.560096 5.111016 4.460184 5.304C4.37412 5.4702720000000005 4.368168 5.739624 4.4467680000000005 5.91132C4.527984 6.088728000000001 4.65756 6.225432 4.820136 6.305280000000001L4.956 6.372 11.957328 6.384L18.95868 6.396 19.013328 6.450672000000001L19.068 6.50532 19.080000000000002 13.014672000000001L19.092 19.524 19.147152000000002 19.644000000000002C19.212528000000002 19.786272 19.367664 19.953192 19.496208 20.0196C19.806816 20.180064 20.22288 20.086224 20.435496 19.807752C20.606544 19.58376 20.593272 20.194728 20.586288 12.86292C20.58024 6.506760000000001 20.578295999999998 6.246912 20.535648000000002 6.12C20.437872 5.8289040000000005 20.303112 5.6132159999999995 20.07696 5.38596C19.892784 5.200872 19.825536 5.151096 19.632 5.0566320000000005C19.219968 4.855536 19.896216 4.871736 12.019008 4.874064000000001C8.160744000000001 4.875192 4.977 4.88436 4.944 4.89444M1.728 7.873824000000001C1.4344080000000001 7.9487760000000005 1.215216 8.073648 0.993888 8.292C0.684648 8.597112000000001 0.526416 8.938224 0.47944800000000004 9.40104C0.46096800000000004 9.583128 0.455592 11.28792 0.46140000000000003 15.144C0.470664 21.307416 0.45225600000000005 20.734152 0.654072 21.144000000000002C0.870432 21.583368 1.351896 21.937512 1.858584 22.030032000000002C1.9589520000000002 22.048368 4.101264 22.05612 9.09576 22.056288C16.120008000000002 22.056504 16.192272 22.056024 16.381176 22.008312C16.684584 21.931728 16.902144 21.808968 17.126112 21.588C17.439768 21.278544 17.595816 20.938296 17.640816 20.465784C17.658504 20.280048 17.663832000000003 18.494856000000002 17.657928 14.736C17.648328 8.610912 17.664936 9.138936 17.469552 8.74356C17.271096 8.341944 16.938888000000002 8.068871999999999 16.428 7.887456L16.284 7.836336 9.096 7.832112C2.08596 7.827984 1.903536 7.829016 1.728 7.873824000000001M2.196 9.323688C2.1828000000000003 9.328152000000001 2.141592 9.33852 2.104416 9.346752C1.98144 9.373968 1.968 9.453192 1.968 10.151232L1.968 10.776 9.06 10.776L16.152 10.776 16.152 10.155576C16.152 9.503904 16.139256000000003 9.406080000000001 16.04748 9.353496C16.007136000000003 9.330384 14.505047999999999 9.323088 9.108 9.319776000000001C5.3196 9.317472 2.2092 9.319224 2.196 9.323688M1.968 13.188L1.968 14.088000000000001 4.896 14.088000000000001L7.824 14.088000000000001 7.824 13.188L7.824 12.288 4.896 12.288L1.968 12.288 1.968 13.188M9.312 13.188L9.312 14.088000000000001 10.644 14.088000000000001L11.976 14.088000000000001 11.976 13.188L11.976 12.288 10.644 12.288L9.312 12.288 9.312 13.188M13.488 13.188L13.488 14.088000000000001 14.82 14.088000000000001L16.152 14.088000000000001 16.152 13.188L16.152 12.288 14.82 12.288L13.488 12.288 13.488 13.188M1.968 16.416096L1.968 17.232192 4.89 17.226096000000002L7.812 17.22 7.818312 16.41L7.824648 15.6 4.896312 15.6L1.968 15.6 1.968 16.416096M9.317688 16.41L9.324 17.22 10.65 17.226192L11.976 17.232408000000003 11.976 16.416192000000002L11.976 15.6 10.643688000000001 15.6L9.311352000000001 15.6 9.317688 16.41M13.488 16.416L13.488 17.232 14.82 17.232L16.152 17.232 16.152 16.416L16.152 15.6 14.82 15.6L13.488 15.6 13.488 16.416M1.9683359999999999 19.553904C1.968504 20.012664 1.974936 20.411424 1.982616 20.440032000000002C2.014368 20.558376000000003 1.9527599999999998 20.556 4.98 20.556L7.812 20.556 7.812 19.644000000000002L7.812 18.732 4.89 18.725904L1.968 18.719808 1.9683359999999999 19.553904M9.322944000000001 18.750096C9.316583999999999 18.766656 9.314232 19.179744 9.317688 19.668096000000002L9.324 20.556 10.65 20.562192L11.976 20.568408 11.976 19.644192L11.976 18.72 10.655256 18.72C9.618552000000001 18.72 9.332016 18.72648 9.322944000000001 18.750096M13.488 19.644000000000002L13.488 20.568 14.694 20.567856000000003C15.47196 20.567784 15.932616000000001 20.558664 15.991920000000002 20.542199999999998C16.147488 20.499 16.152 20.47068 16.152 19.536768000000002L16.152 18.72 14.82 18.72L13.488 18.72 13.488 19.644000000000002"
                        stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth="0.024"/>
                </svg>
            )
        },
        {
            id: 'servers',
            title: 'Servers',
            path: '/servers',
            yamlProperty: 'servers',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
                </svg>
            )
        },
        {
            id: 'team',
            title: 'Team',
            path: '/team',
            yamlProperty: 'team',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
            )
        },
        {
            id: 'support',
            title: 'Support',
            path: '/support',
            yamlProperty: 'support',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            )
        },
        {
            id: 'roles',
            title: 'Roles',
            path: '/roles',
            yamlProperty: 'roles',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
            )
        },
        {
            id: 'pricing',
            title: 'Pricing',
            path: '/pricing',
            yamlProperty: 'pricing',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            )
        },
        {
            id: 'sla',
            title: 'SLA',
            path: '/sla',
            yamlProperty: 'slaProperties',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
            )
        },
        {
            id: 'custom-properties',
            title: 'Custom Properties',
            path: '/custom-properties',
            yamlProperty: 'customProperties',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            )
        }
    ];

    return (
        <div
            className="w-56 min-h-[calc(100vh-4.1rem)] overflow-y-auto border-r border-gray-300 bg-gray-50 p-4 shrink-0 text-gray-700 font-medium flex flex-col">
            <nav className="flex mt-2 w-full" aria-label="Progress">
                <ol role="list" className="space-y-3 w-full">
                    {navigationItems.map((item) => (
                        <li key={item.id}>
                            {item.id === 'schemas' ? (
                                <div>
                                    <Link
                                        to={item.path}
                                        onClick={(e) => handleNavigationClick(e, item)}
                                        className={`flex flex-row items-center py-1 transition-colors -mx-4 pl-4 pr-4 border-l-2 ${
                                            location.pathname === item.path
                                                ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                                : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                        }`}
                                    >
                                        <div className="flex size-4 shrink-0 items-center justify-center"
                                             aria-hidden="true">
                                            {item.icon || <div className="size-2 rounded-full bg-gray-300"></div>}
                                        </div>
                                        <p className="ml-1.5 text-sm font-medium">{item.title}</p>
                                    </Link>
                                    {schemas.length > 0 && (
                                        <ol className="mt-1 space-y-0.5">
                                            {schemas.map((schema, index) => (
                                                <li key={index}>
                                                    <Link
                                                        to={`/schemas/${index}`}
                                                        onClick={(e) => handleNavigationClick(e, {
                                                            path: `/schemas/${index}`,
                                                            yamlProperty: 'schema'
                                                        })}
                                                        className={`flex items-center text-sm py-1 transition-colors -mx-4 pl-10 pr-4 border-l-2 ${
                                                            location.pathname === `/schemas/${index}`
                                                                ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                                                : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                                        }`}
                                                    >
                                                        <div className="w-3 h-3 mr-1.5 shrink-0">
																													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" version="1.1">
																														<path d="M2.896272 2.940456C1.7469839999999999 3.133584 0.8508720000000001 4.081176 0.721656 5.240016C0.685776 5.561808 0.685776 18.438192 0.721656 18.759984000000003C0.8346240000000001 19.773096000000002 1.534992 20.636928 2.50668 20.9616C2.933976 21.104376000000002 2.328408 21.095807999999998 12 21.095807999999998C21.642167999999998 21.095807999999998 21.03768 21.104256000000003 21.48 20.963352C22.450704 20.654112 23.16468 19.779312 23.278344 18.759984000000003C23.314224000000003 18.438192 23.314224000000003 5.561808 23.278344 5.240016C23.148168 4.072488000000001 22.248504 3.128088 21.087 2.939712C20.896272 2.908776 19.719648000000003 2.904504 11.976 2.906568C4.749672 2.908488 3.0488399999999998 2.914824 2.896272 2.940456M2.972544 4.471584C2.62116 4.591368 2.336256 4.893576 2.245248 5.243040000000001C2.213424 5.365248 2.208 5.614296 2.208 6.95304L2.208 8.52 12 8.52L21.792 8.52 21.792 6.95304C21.792 5.614296 21.786576 5.365248 21.754752 5.243040000000001C21.662088 4.887192000000001 21.359928 4.5732 21.004488000000002 4.463424C20.852712 4.416552 20.748264 4.416 11.99148 4.4166240000000005L3.132 4.417248 2.972544 4.471584M2.208 12.096L2.208 14.16 4.968 14.16L7.728 14.16 7.728 12.096L7.728 10.032 4.968 10.032L2.208 10.032 2.208 12.096M9.24 12.096L9.24 14.16 12 14.16L14.76 14.16 14.76 12.096L14.76 10.032 12 10.032L9.24 10.032 9.24 12.096M16.272000000000002 12.096L16.272000000000002 14.16 19.032 14.16L21.792 14.16 21.792 12.096L21.792 10.032 19.032 10.032L16.272000000000002 10.032 16.272000000000002 12.096M2.208 17.130959999999998C2.208 18.393792 2.21352 18.635160000000003 2.245248 18.75696C2.3379119999999998 19.112808 2.640072 19.4268 2.995512 19.536576C3.1438800000000002 19.582416 3.226104 19.584 5.43852 19.584L7.728 19.584 7.728 17.616L7.728 15.648 4.968 15.648L2.208 15.648 2.208 17.130959999999998M9.24 17.616L9.24 19.584 12 19.584L14.76 19.584 14.76 17.616L14.76 15.648 12 15.648L9.24 15.648 9.24 17.616M16.272000000000002 17.616L16.272000000000002 19.584 18.56148 19.584C20.773896 19.584 20.85612 19.582416 21.004488000000002 19.536576C21.359928 19.4268 21.662088 19.112808 21.754752 18.75696C21.78648 18.635160000000003 21.792 18.393792 21.792 17.130959999999998L21.792 15.648 19.032 15.648L16.272000000000002 15.648 16.272000000000002 17.616" stroke="none" fill="currentColor" fillRule="evenodd" strokeWidth="0.024"></path>
																													</svg>
                                                        </div>
                                                        {schema.name || schema.businessName || 'Untitled Schema'}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            ) : item.id === 'servers' ? (
                                <div>
                                    <Link
                                        to={item.path}
                                        onClick={(e) => handleNavigationClick(e, item)}
                                        className={`flex flex-row items-center py-1 transition-colors -mx-4 pl-4 pr-4 border-l-2 ${
                                            location.pathname === item.path
                                                ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                                : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                        }`}
                                    >
                                        <div className="flex size-4 shrink-0 items-center justify-center"
                                             aria-hidden="true">
                                            {item.icon || <div className="size-2 rounded-full bg-gray-300"></div>}
                                        </div>
                                        <p className="ml-1.5 text-sm font-medium">{item.title}</p>
                                    </Link>
                                    {servers.length > 0 && (
                                        <ol className="mt-1 space-y-0.5">
                                            {servers.filter(server => server).map((server, index) => (
                                                <li key={index}>
                                                    <Link
                                                        to={`/servers/${index}`}
                                                        onClick={(e) => handleNavigationClick(e, {
                                                            path: `/servers/${index}`,
                                                            yamlProperty: 'servers'
                                                        })}
                                                        className={`flex items-center gap-1.5 text-xs py-1 transition-colors -mx-4 pl-10 pr-4 border-l-2 ${
                                                            location.pathname === `/servers/${index}`
                                                                ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                                                : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                                        }`}
                                                    >
                                                        <span
                                                            className="shrink-0">{getServerTypeIcon(server?.type)}</span>
                                                        <span
                                                            className="flex-1 truncate">{server?.server || `Server ${index + 1}`}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            ) : item.path ? (
                                <Link
                                    to={item.path}
                                    onClick={(e) => handleNavigationClick(e, item)}
                                    className={`flex flex-row items-center py-1 transition-colors -mx-4 pl-4 pr-4 border-l-2 ${
                                        location.pathname === item.path
                                            ? 'bg-indigo-50 text-indigo-600 font-semibold border-indigo-600'
                                            : 'hover:bg-gray-100 hover:text-indigo-600 border-transparent'
                                    }`}
                                >
                                    <div className="flex size-4 shrink-0 items-center justify-center"
                                         aria-hidden="true">
                                        {item.icon || <div className="size-2 rounded-full bg-gray-300"></div>}
                                    </div>
                                    <p className="ml-1.5 text-sm font-medium">{item.title}</p>
                                </Link>
                            ) : (
                                <div className="flex flex-row items-center">
                                    <div className="flex size-4 shrink-0 items-center justify-center"
                                         aria-hidden="true">
                                        {item.icon || <div className="size-2 rounded-full bg-gray-300"></div>}
                                    </div>
                                    <p className="ml-1.5 text-sm font-medium">{item.title}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Footer Links */}
            <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                <a
                    href="https://datacontract.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                    Documentation
                </a>
                <a
                    href="https://entropy-data.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    Created by Entropy Data
                </a>
            </div>
        </div>
    );
};

export default SidebarNavigation;
