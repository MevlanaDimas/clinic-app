<?php

namespace App\Console\Commands;

use App\Models\Patient;
use App\Models\PurchaseRequests;
use App\Models\TotalPatientBills;
use App\Models\TotalUtilityCosts;
use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the sitemap.xml file for the clinic_app';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting sitemap generation...');

        $sitemap = Sitemap::create();

        // 1. Add Static/Index Pages
        $pages = [
            '/dashboard',
            '/users',
            '/permissions',
            '/roles',
            '/finance-management',
            '/staff-salary',
            '/staff-salary-costs',
            '/marketings',
            '/medical-waste',
            '/utility-cost',
            '/supplier',
            '/inventory',
            '/purchase',
            '/purchase-item-delivery',
            '/bills',
            '/medicine',
            '/patient-data',
            '/patient-registration',
            '/diagnose',
            '/prescription',
            '/total-patient-bill',
        ];

        foreach ($pages as $page) {
            $sitemap->add(Url::create($page)
                ->setPriority(0.8)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY));
        }

        // 2. Add Dynamic Pages (Only those with GET routes defined in web.php)

        // Route: /total-patient-bill/{id}/print
        TotalPatientBills::all()->each(function (TotalPatientBills $bill) use ($sitemap) {
            $sitemap->add(Url::create("/total-patient-bill/{$bill->id}/print")
                ->setLastModificationDate($bill->updated_at)
                ->setPriority(0.6));
        });

        // Route: /patient-data/{id}/health-data
        Patient::all()->each(function (Patient $patient) use ($sitemap) {
            $sitemap->add(Url::create("/patient-data/{$patient->id}/health-data")
                ->setLastModificationDate($patient->updated_at)
                ->setPriority(0.7));
        });

        // Route: /utility-cost/{id}/utilities
        TotalUtilityCosts::all()->each(function (TotalUtilityCosts $cost) use ($sitemap) {
            $sitemap->add(Url::create("/utility-cost/{$cost->id}/utilities")
                ->setLastModificationDate($cost->updated_at)
                ->setPriority(0.7));
        });

        // Route: /purchase/{id}/request-items
        PurchaseRequests::all()->each(function (PurchaseRequests $request) use ($sitemap) {
            $sitemap->add(Url::create("/purchase/{$request->id}/request-items")
                ->setLastModificationDate($request->updated_at)
                ->setPriority(0.7));
        });

        $sitemap->writeToFile(public_path('sitemap.xml'));
        $this->info('sitemap.xml generated successfully!');
    }
}
