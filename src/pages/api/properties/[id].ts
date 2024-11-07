import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db';
import Property from '../../../models/Property';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    const { id } = req.query;

    switch (req.method) {
        case 'GET':
            try {
                const property = await Property.findById(id).populate('host', 'username');
                if (!property) {
                    return res.status(404).json({ success: false, message: 'Property not found' });
                }
                res.status(200).json({ success: true, data: property });
            } catch (error) {
                res.status(400).json({ success: false, message: 'Failed to fetch property' });
            }
            break;

        case 'PUT':
            try {
                const property = await Property.findByIdAndUpdate(id, req.body, { new: true });
                if (!property) {
                    return res.status(404).json({ success: false, message: 'Property not found' });
                }

                res.status(200).json({ success: true, data: property });
            } catch (error) {
                res.status(400).json({ success: false, message: 'Failed to update property' });
            }
            break;

        case 'DELETE':
                    try {
                        const property = await Property.findById(id);
                        if (!property) {
                            return res.status(404).json({ success: false, message: 'Property not found' });
                        }
        
                        await Property.findByIdAndDelete(id);
        
                        await User.findByIdAndUpdate(property.host, {
                            $pull: { properties: id },
                        });
        
                        res.status(200).json({ success: true, message: 'Property deleted successfully' });
                    } catch (error) {
                        res.status(400).json({ success: false, message: 'Failed to delete property' });
                    }
                    break;
        
                default:
                    res.status(405).json({ success: false, message: 'Method Not Allowed' });
                    break;
            }
        }